const { v4: uuidv4 } = require('uuid');

const plans = new Map();

function savePlan(plan) {
  const id = uuidv4();
  plans.set(id, plan);
  return id;
}

function getPlan(id) {
  return plans.get(id);
}

function updatePlan(id, newPlan) {
  plans.set(id, newPlan);
}

module.exports = { savePlan, getPlan, updatePlan };
