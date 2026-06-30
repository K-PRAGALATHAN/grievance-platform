const generateComplaintNumber = () => {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `GRV-${yyyymmdd}-${random}`;
};

module.exports = generateComplaintNumber;
