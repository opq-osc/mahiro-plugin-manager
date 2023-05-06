import type { IMahiroUse, Mahiro } from 'mahiro'
import { pWrapper, pluginName } from './config'

import { openPluginInAllGroup } from './utils'
import type { pluginProps } from './types'
import registerFriend from './friend'
import registerGroup from './group'

export default function Plugin (props: pluginProps) {
  const {
    superAdmins,
    expireTime = '6 M',
    ignoreGroups = []
  } = props

  const init = (mahiro: Mahiro) => new Promise(async (resolve, reject): Promise<any> => {
    if (!/^\d+ (d|w|M|y|day|week|month|year)+$/.test(expireTime)) return reject('过期时间不正确')

    const plugins = await mahiro.db.getPlugins()
    const plugin = plugins.filter((i) => i.name === pluginName)[0]
    if (!plugin) {
      return resolve(null)
    }
    if (mahiro.utils.lodash.eq(plugin.white_list_users, superAdmins)) {
      plugin.white_list_users = superAdmins
      await mahiro.db.updatePlugin(plugin)
    }
    await openPluginInAllGroup(mahiro, pluginName, ignoreGroups)
  })

  const use: IMahiroUse = async (mahiro) => {
    const logger = mahiro.logger.withTag(pluginName) as typeof mahiro.logger

    logger.info(`加载${pWrapper(pluginName)}插件 ...`)

    try {
      await init(mahiro)
    } catch (err) {
      logger.error(`加载${pWrapper(pluginName)}插件失败`, err)
      return
    }

    const config = { superAdmins, duration: expireTime, ignoreGroups }
    registerFriend(config, mahiro, logger)
    registerGroup(config, mahiro, logger)

    logger.success(`插件插件管理加载成功`)
  }
  return use
}
