import { closeAllPluginsInGroup, getHelp, openAllPluginsInGroup } from "./utils"
import { defaultGroupName, pWrapper, pluginName } from "./config"

import type { Mahiro } from "mahiro"
import type { pluginProps } from "./types"

export default function registerGroup (config: pluginProps, mahiro: Mahiro, logger: typeof mahiro.logger) {
  const { superAdmins } = config

  mahiro.onGroupMessage(pluginName, async (data) => {
    const sendText = (text: string) => {
      mahiro.sendGroupMessage({
        groupId: data.groupId,
        msg: {
          Content: text
        }
      })
    }

    // 补上添加群时没填写的名字
    const updateGroupName = async () => {
      const groupInfo = await mahiro.db.getGroupMapFromCache(data.groupId)
      if (groupInfo.name === defaultGroupName) {
        await mahiro.db.updateGroup({
          id: groupInfo.id,
          name: data.groupName
        })
        logger.info(`群${data.groupId}名称已更新为${data.groupName}`)
      }
    }

    if (/插件/.test(data?.msg?.Content)) {
      const groupInfo = await mahiro.db.getGroupMapFromCache(data.groupId)
      await updateGroupName()

      if (!groupInfo.admins.concat(superAdmins).includes(data.userId)) return

      if (data?.msg?.Content === '插件管理') {
        sendText(getHelp('group'))
      }

      const allPlugins = (await mahiro.db.getPluginListFromCache()).filter((i) => !i.internal && i.name != pluginName)
      const availablePlugins = data.configs.availablePlugins.filter((i) => !i.startsWith('[') && i !== pluginName)
      const closedPlugins = allPlugins.filter((i) => !availablePlugins.includes(i.name)).map(i => i.name)
      const plugins = availablePlugins
      for (const i of closedPlugins) {
        plugins.push(`${i}[已关闭]`)
      }

      if (data.msg.Content === '插件列表') {
        sendText(`插件列表：${plugins.join('，')}`)
        return
      }

      if (data.msg.Content === '开启所有插件') {
        await openAllPluginsInGroup(mahiro, data.groupId)
        sendText(`已开启所有插件`)
        return
      }

      if (data.msg.Content === '关闭所有插件') {
        await closeAllPluginsInGroup(mahiro, data.groupId)
        sendText(`已关闭所有插件`)
        return
      }

      if (data.msg.Content?.startsWith('开启插件')) {
        const pluginName = data.msg.Content.replace('开启插件', '').trim()
        const plugin = allPlugins.filter(i => i.name === pluginName)[0]
        if (plugin?.enabled === false) {
          await mahiro.db.openPlugin({
            groupId: data.groupId,
            pluginName
          }).then(() => {
            sendText(`已开启插件${pWrapper(pluginName)}`)
          })
        }
        return
      }

      if (data.msg.Content?.startsWith('关闭插件')) {
        const pluginName = data.msg.Content.replace('关闭插件', '').trim()
        const plugin = allPlugins.filter(i => i.name === pluginName)[0]
        if (plugin?.enabled === false) {
          mahiro.db.closePlugin({
            groupId: data.groupId,
            pluginName
          }).then(() => {
            sendText(`已关闭插件${pWrapper(pluginName)}`)
          })
        }
        return
      }
    }

    if (data?.msg?.Content?.startsWith('添加群管') && data?.msg?.AtUinLists?.length > 0) {
      const groupInfo = await mahiro.db.getGroupMapFromCache(data.groupId)
      await updateGroupName()

      if (!groupInfo.admins.concat(superAdmins).includes(data.userId)) return

      for (const user of data.msg.AtUinLists) {
        const target = user.Uin
        if (!groupInfo.admins.includes(target)) {
          groupInfo.admins.push(target)
        }
      }
      await mahiro.db.updateGroup(groupInfo)
      sendText(`添加成功`)
      return
    }

    if (data?.msg?.Content?.startsWith('移除群管') && data?.msg?.AtUinLists?.length > 0) {
      const groupInfo = await mahiro.db.getGroupMapFromCache(data.groupId)
      await updateGroupName()

      if (!groupInfo.admins.concat(superAdmins).includes(data.userId)) return

      for (const user of data.msg.AtUinLists) {
        const target = user.Uin
        if (!groupInfo.admins.includes(target)) {
          groupInfo.admins.push(target)
        }
      }
      await mahiro.db.updateGroup(groupInfo)
      sendText(`移除成功`)
      return
    }
  })
}
