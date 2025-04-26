// 策略组名称
const groupName = 'Loadb';
(async () => {
  // 获取当前策略组状态
  const group = await $httpAPI('GET', `/v1/policies/${groupName}`);
  const current = group.policy;
  const all = group.policies;
  // 找出下一个节点
  const index = (all.indexOf(current) + 1) % all.length;
  const next = all[index];
  // 切换到下一个节点
  await $httpAPI('POST', `/v1/policies/${groupName}`, { policy: next });
  $notification.post('Surge节点已切换', `Loadb`, `从 ${current} 切换到 ${next}`);
  $done();
})();
