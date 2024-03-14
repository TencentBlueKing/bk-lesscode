import { pathToRegexp } from 'path-to-regexp';
import {
  Controller,
  Post,
  Ctx,
  PathParams,
  BodyParams,
  OutputJson,
} from '../decorator';
import dataService from '../service/data-service';
import {
  parseConditions,
  filterTableDataWithConditions,
  filterTableDataWithKeys,
} from '../service/form';
import dataSourceController from './data-source';
import { METHODS_WITHOUT_DATA } from '../../shared/constant';

@Controller('/api/open-api')
export default class OpenApiController {
  // 回写接口
  @OutputJson()
  @Post('/dataManage')
  async dataManage(@BodyParams() data) {
    const {
      creator,
      action,
      conditions,
      mapping,
      tableName,
    } = data;
    let result;

    const getDatasByConditions = async () => {
      const query = parseConditions(conditions);
      const result = await dataService.get({
        tableFileName: tableName,
        query,
      });
      return result;
    };
    const handleEditData = async () => {
      const editDatas = await getDatasByConditions();
      editDatas.forEach((editData) => {
        mapping.forEach((dataMap) => {
          editData[dataMap.key] = dataMap.value;
        });
      });
      result = await dataService.update(tableName, {
        ...editDatas,
        updateUser: creator,
      });
    };
    const handleAddData = async () => {
      const newData = mapping.reduce((acc, cur) => {
        acc[cur.key] = cur.value;
        return acc;
      }, {});
      result = await dataService.add(tableName, {
        ...newData,
        createUser: creator,
        updateUser: creator,
      });
    };
    const handleDeleteData = async () => {
      const deleteDatas = await getDatasByConditions();
      result = await dataService.bulkDelete(tableName, deleteDatas.map(data => data.id));
    };
    switch (action) {
      case 'EDIT':
        await handleEditData();
        break;
      case 'ADD':
        await handleAddData();
        break;
      case 'DELETE':
        await handleDeleteData();
        break;
    }
    return result;
  }

  // 数据筛选接口
  @OutputJson()
  @Post('/filterTableData/keys/tableName/:tableName')
  async filterTableDataWithKeys(
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'page' }) page,
        @BodyParams({ name: 'pageSize' }) pageSize,
        @BodyParams({ name: 'query', default: {} }) query,
        @BodyParams({ name: 'fields' }) fields,
  ) {
    // 获取数据
    return filterTableDataWithKeys(tableName, query, page, pageSize, fields);
  }

  // 表单数据源
  @OutputJson()
  @Post('/filterTableData/conditions/tableName/:tableName')
  async filterTableDataWithConditions(
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'conditions' }) conditions,
        @BodyParams({ name: 'field' }) field,
        @BodyParams({ name: 'group' }) group,
  ) {
    // 获取数据
    return filterTableDataWithConditions(conditions, tableName, group, field);
  }

  // api节点在itsm回调
  @Post('/executeApi')
  async executeApi(
        @Ctx() ctx,
        @BodyParams() body,
  ) {
    try {
      const dataTableOperatePaths = ['/user/tableName/:tableName/detail', '/user/tableName/:tableName'];
      const { url, method = 'get', data: apiData, creatorUsername = '' } = body;
      const basePath = Reflect.getMetadata('basePath', dataSourceController);
      const controllerRoutes = Reflect.getMetadata('routes', dataSourceController.prototype);
      const dataTableOperateRoutes = controllerRoutes.filter(route => dataTableOperatePaths.includes(route.path));

      let tableNameParam; let tableOperateHandler;
      dataTableOperateRoutes.some((item) => {
        const matchedPath = pathToRegexp(item.path).exec(url.replace(basePath, ''));
        if (matchedPath && matchedPath.length > 0 && item.method === method) {
          tableNameParam = matchedPath[1];
          tableOperateHandler = item.propertyKey;
          return true;
        }
      });
      if (tableNameParam && tableOperateHandler) {
        ctx.params = { tableName: tableNameParam };
        if (METHODS_WITHOUT_DATA.includes(method)) {
          ctx.request.query = apiData;
        } else {
          ctx.request.body = apiData;
        }
        ctx.session.userInfo = { username: creatorUsername };
        await dataSourceController.prototype[tableOperateHandler](ctx);
      } else {
        throw new global.BusinessError('api调用失败', -1, 500);
      }
    } catch (e) {
      throw new global.BusinessError('api调用失败', -1, 500);
    }
  }

  // 执行sql获取某张表下数据
  @OutputJson()
  @Post('/execQuerySql')
  async execQuerySql(@BodyParams({ name: 'sql' }) sql) {
    try {
      // 涉及到表变更sql的关键词
      const sqlKeywords = ['DROP DATABASE', 'TRRUNCATE TABLE', 'DROP TABLE', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'INSERT INTO'];
      const upperCaseSql = sql && sql.toUpperCase();
      // 此接口只能执行查询语句，禁止执行任何涉及表变更的语句
      if (!upperCaseSql || !upperCaseSql.startsWith('SELECT') || sqlKeywords.indexOf(upperCaseSql) !== -1) {
        throw new global.BusinessError('sql语句未以SELECT开头或含有变更数据表的危险关键词', -1, 400);
      }
      return await dataService.execSql(sql);
    } catch (e) {
      throw new global.BusinessError(e.sqlMessage || e.message || '执行查询sql失败', -1, 500);
    }
  }
}
