export const raiseAlert = (userId: string, risk: string) => {
  console.warn(`🚨 ALERT: User ${userId} risk level = ${risk}`);
};
