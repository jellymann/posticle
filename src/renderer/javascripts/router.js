import { createWebHashHistory, createRouter } from "vue-router";

import Database from './Database.vue';
import Connections from './Connections.vue';

import DatabaseList from './DatabaseList.vue';
import TableList from './TableList.vue';
import TableView from './TableView.vue';

import TableContent from './TableContent.vue';
import TableStructure from './TableStructure.vue';

const routes = [
  {
    path: "/",
    name: "Connections",
    component: Connections,
  },
  {
    path: "/connection/:connectionId",
    name: "Connection",
    component: Database,
    props: true,
    children: [
      {
        path: 'databases',
        name: 'Databases',
        component: DatabaseList,
        props: true,
      },
      {
        path: 'databases/:database',
        name: 'Tables',
        component: TableList,
        props: true,
      },
      {
        path: 'database/:database/schema/:schema/table/:table',
        component: TableView,
        name: 'Table',
        props: true,
        children: [
          {
            path: 'content',
            name: 'TableContent',
            component: TableContent,
            props: true,
          },
          {
            path: 'structure',
            name: 'TableStructure',
            component: TableStructure,
            props: true,
          },
        ]
      }
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
