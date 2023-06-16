import type { UnitType, pluginProps } from "./types"
import { closePluginInAllGroup, getHelp, initAllGroup, openPluginInAllGroup } from "./utils"
import { defaultGroupName, pWrapper, pluginName } from "./config"

import type { IMvcGroup } from "mahiro/dist/database/interface"
import type { Mahiro } from "mahiro"

export default function registerFriend (config: pluginProps, mahiro: Mahiro, logger: typeof mahiro.logger) {
  const { superAdmins, expireTime, ignoreGroups } = config

  mahiro.onFriendMessage(pluginName, async (data) => {
    const sendText = (text: string) => {
      mahiro.sendFriendMessage({
        userId: data.userId,
        msg: {
          Content: text
        }
      })
    }

    if (/^添加群\s*\d+/.test(data?.msg?.Content)) {
      if (!superAdmins.includes(data.userId)) return
      const groupId = data.msg.Content.replace('添加群', '').trim()
      const groupInfo = await mahiro.db.getGroupMapFromCache(Number(groupId))
      if (groupInfo?.id) {
        sendText(`群${groupInfo.name}(${groupId})已存在`)
        return
      }
      const group = {} as Omit<IMvcGroup, 'id'>
      const internalPluginIds = await mahiro.db.getInternalPluginIds()
      group.group_id = Number(groupId)
      group.plugins = [...internalPluginIds]
      group.admins = superAdmins
      group.name = defaultGroupName
      group.link_qqs = [data.qq]
      group.expired_at = mahiro.utils.dayjs().add(parseInt(expireTime), expireTime.replace(/\d+./, '') as UnitType).toISOString()
      mahiro.db.addGroup(group).then(() => {
        sendText(`添加群${groupId}成功`)
      }).then(() => {
        logger.info(data.userName, '添加群', groupId)
      })
      return
    }

    /**
     * 开启所有群的所有插件，谨慎使用！
     */
    if (data?.msg?.Content === '初始化所有群') {
      if (!superAdmins.includes(data.userId)) return
      await initAllGroup(mahiro, data.qq, ignoreGroups)
      sendText(`初始化成功，注意：所有群的所有插件已开启！`)
      return
    }

    if (/插件/.test(data?.msg?.Content)) {
      if (!superAdmins.includes(data.userId)) return
      if (data?.msg?.Content === '插件管理') {
        sendText(getHelp('friend'))
      }

      const allPlugins = (await mahiro.db.getPluginListFromCache()).filter((i) => !i.internal && i.name != pluginName)
      if (data?.msg?.Content === '插件列表') {
        sendText(`插件列表：${allPlugins.map((i) => i.name).join('，')}`)
        return
      }

      if (data?.msg?.Content.startsWith('为所有群开启插件')) {
        const pluginName = data.msg.Content.replace('为所有群开启插件', '').trim()
        if (allPlugins.some((i) => i.name === pluginName)) {
          await openPluginInAllGroup(mahiro, pluginName, data.qq, ignoreGroups)
          sendText(`开启成功，注意：所有群的${pWrapper(pluginName)}插件已开启！`)
        }
        return
      }

      if (data?.msg?.Content.startsWith('为所有群关闭插件')) {
        const pluginName = data.msg.Content.replace('为所有群关闭插件', '').trim()
        if (allPlugins.some((i) => i.name === pluginName)) {
          await closePluginInAllGroup(mahiro, pluginName, data.qq, ignoreGroups)
          sendText(`关闭成功，注意：所有群的${pWrapper(pluginName)}插件已关闭！`)
        }
        return
      }
    }
  })
}
