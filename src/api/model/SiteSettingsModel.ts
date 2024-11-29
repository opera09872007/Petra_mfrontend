import { BasicFetchResult } from '/@/api/model/baseModel';

export interface SiteSettingsListItem {
  id: string;
  content_type: string;
  content_key: string;
  content_value: string;
  extra_info: string;
  priority: string;
}
export type SiteSettingsPageListGetResultModel = BasicFetchResult<SiteSettingsListItem>;
