import type { App } from 'vue';
import { Button } from './Button';
import { Input, Layout, Upload, Progress } from 'ant-design-vue';

export function registerGlobComp(app: App) {
  app.use(Input).use(Button).use(Layout).use(Upload).use(Progress);
}
