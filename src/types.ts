export type UnitType = 'd' | 'w' | 'M' | 'y' | 'day' | 'week' | 'month' | 'year'

export interface pluginProps {
  /**
   * 超级管理员，用于在添加群时添加默认管理员，同时也是插件管理的VIP，如不填写，将无法通过私聊使用
   */
  superAdmins: number[]
  /**
   * 添加新群时相对于当前的过期时间,默认为"6 M", 表示6个月后过期，注意空格
   */
  expireTime?: `${number} ${UnitType}`
  /**
   * 通过私聊进行插件管理时忽略的群聊
   */
  ignoreGroups?: number[]
}
