class BaseDepartmentAdapter {
  constructor(departmentCode, departmentName) {
    this.departmentCode = departmentCode;
    this.departmentName = departmentName;
  }

  async fetchData(citizenId) {
    throw new Error('fetchData method must be implemented by concrete department adapter');
  }

  normalize(raw) {
    throw new Error('normalize method must be implemented by concrete department adapter');
  }
}

module.exports = BaseDepartmentAdapter;
