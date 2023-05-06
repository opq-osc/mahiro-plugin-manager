import type { Mahiro } from "mahiro"

export function getHelp (type: 'friend' | 'group'): string {
  let doc = '可用指令：插件管理、'
  switch (type) {
    case 'friend':
      doc += `添加群xxx、初始化所有群、插件列表、为所有群开启插件xx、为所有群关闭插件xx`
      break
    default:
      doc += `插件列表、开启所有插件、关闭所有插件、开启插件、关闭插件、添加群管、移除群管`
      break
  }
  return doc
}

export async function openAllPluginsInGroup (mahiro: Mahiro, groupId: number) {
  const plugins = await mahiro.db.getPlugins()
  for (const plugin of plugins) {
    await mahiro.db.openPlugin({ groupId: groupId, pluginName: plugin.name })
  }
}
export async function closeAllPluginsInGroup (mahiro: Mahiro, groupId: number) {
  const plugins = await mahiro.db.getPlugins()
  for (const plugin of plugins) {
    await mahiro.db.closePlugin({ groupId: groupId, pluginName: plugin.name })
  }
}

export async function initAllGroup (mahiro: Mahiro, ignoreGroups: number[]) {
  const groups = await mahiro.db.getGroups()
  for (const group of groups) {
    if (!ignoreGroups.includes(group.group_id)) {
      await openAllPluginsInGroup(mahiro, group.group_id)
    }
  }
}

export async function openPluginInAllGroup (mahiro: Mahiro, pluginName: string, ignoreGroups: number[]) {
  const groups = await mahiro.db.getGroups()
  for (const group of groups) {
    if (!ignoreGroups.includes(group.group_id)) {
      await mahiro.db.openPlugin({
        groupId: group.group_id,
        pluginName
      })
    }
  }
}

export async function closePluginInAllGroup (mahiro: Mahiro, pluginName: string, ignoreGroups: number[]) {
  const groups = await mahiro.db.getGroups()
  for (const group of groups) {
    if (!ignoreGroups.includes(group.group_id)) {
      await mahiro.db.closePlugin({
        groupId: group.group_id,
        pluginName
      })
    }
  }
}
