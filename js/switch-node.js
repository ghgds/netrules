const groupName = 'Loadb'; // 策略组名
const minWeight = 10;      // 最小权重

(async () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=周日

  if (hour < 18) {
    console.log(`现在是${hour}点，还没到晚上高峰期，不切换节点`);
    $done();
    return;
  }
  if (day > 0 & day < 5) {
    console.log(`今天是工作日，不切换节点`);
    $done();
    return;
  }

  $httpAPI("GET", "/v1/policy_groups", null, (data) => {
    try {
      const group = data["policy_groups"].find(g => g.name === groupName);

      if (!group) {
        console.log(`找不到策略组: ${groupName}`);
        $done();
        return;
      }

      const allPolicies = group.policies.map(p => p.name);
      const current = group.selected_policy;

      if (!Array.isArray(allPolicies) || allPolicies.length === 0) {
        console.log('策略组无可用节点');
        $done();
        return;
      }

      const nextPolicy = pickWeightedRandom(allPolicies);

      if (!nextPolicy) {
        console.log('未能选出新的节点');
        $done();
        return;
      }

      // 切换节点
      $httpAPI("POST", "/v1/policy_groups/select", { group_name: groupName, policy: nextPolicy }, (res) => {
        console.log(`已从 ${current} 切换到 ${nextPolicy}`);
        $notification.post('Surge节点切换成功', groupName, `从 ${current} 切换到 ${nextPolicy}`);
        $done();
      });

    } catch (e) {
      console.log('切换失败:', e);
      $done();
    }
  });
})();

// 权重随机抽取函数
function pickWeightedRandom(list) {
  const totalNodes = list.length;
  if (totalNodes === 0) return null;

  // 生成每个节点的权重，越前面权重越大
  const weights = list.map((_, idx) => Math.max((totalNodes - idx) * 10, minWeight));

  // 计算总权重
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // 随机数
  const rand = Math.random() * totalWeight;

  // 根据权重选取
  let cumulative = 0;
  for (let i = 0; i < list.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      return list[i];
    }
  }
  return list[0]; // fallback保险
}
