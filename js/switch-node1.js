const groupName = 'Loadb'; // 策略组名

(async () => {
  $httpAPI("GET", "/v1/policy_groups", null, (data) => {
    try {
      const group = data[groupName];
      if (!group || !Array.isArray(group) || group.length === 0) {
        $done();
        return;
      }
      // 只提取节点名
      const allPolicies = group.filter(p => !p.isGroup).map(p => p.name);
      if (allPolicies.length === 0) {
        $done();
        return;
      }
      // 第二步：拿到当前已选节点
      $httpAPI("GET", `/v1/policy_groups/select?group_name=${encodeURIComponent(groupName)}`, null, (selectedData) => {
        try {
          const currentPolicy = selectedData.policy;
          const currentIndex = allPolicies.indexOf(currentPolicy);
          let nextIndex = (currentIndex + 1) % allPolicies.length;
          const nextPolicy = allPolicies[nextIndex];
          if (!nextPolicy) {
            $done();
            return;
          }
          $httpAPI("POST", "/v1/policy_groups/select", { group_name: groupName, policy: nextPolicy }, (res) => {
            //$notification.post('Surge节点顺序切换成功', groupName, `切换到 ${nextPolicy}`);
            $done();
          });
        } catch (e) {
          console.log('切换节点失败:', e);
          $done();
        }
      });
    } catch (e) {
      console.log('脚本运行错误:', e);
      $done();
    }
  });
})();
