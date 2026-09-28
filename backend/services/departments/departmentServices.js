const {
  aapleSarkarMock,
  mahaDbtMock,
  mahabhulekhMock,
  epanchayatMock,
  maitriMock
} = require('../../mock-data/departmentsData');

class AapleSarkarService {
  static async getCitizenProfile(citizenId) {
    // Simulate real network delay
    await new Promise(r => setTimeout(r, 60));
    const record = aapleSarkarMock[citizenId];
    if (!record) {
      return { found: false, error: 'Record not registered in Aaple Sarkar citizen portal' };
    }
    return {
      found: true,
      department: 'AAPLE_SARKAR',
      departmentName: 'Aaple Sarkar Citizen Services Registry',
      rawPayload: { ...record },
      fetchedAt: new Date().toISOString()
    };
  }
}

class MahaDbtService {
  static async getScholarshipsAndBenefits(citizenId) {
    await new Promise(r => setTimeout(r, 70));
    const record = mahaDbtMock[citizenId];
    if (!record) {
      return { found: false, error: 'No scholarship / DBT profile exists for this citizen' };
    }
    return {
      found: true,
      department: 'MAHADBT',
      departmentName: 'MahaDBT Direct Benefit Transfer',
      rawPayload: { ...record },
      fetchedAt: new Date().toISOString()
    };
  }
}

class MahaBhulekhService {
  static async getLandRecords(citizenId) {
    await new Promise(r => setTimeout(r, 80));
    const record = mahabhulekhMock[citizenId];
    if (!record) {
      return { found: false, error: 'No 7/12 land records registered under this citizen identifier' };
    }
    return {
      found: true,
      department: 'MAHABHULEKH',
      departmentName: 'Mahabhulekh Land Records (Revenue Dept)',
      rawPayload: { ...record },
      fetchedAt: new Date().toISOString()
    };
  }
}

class EPanchayatService {
  static async getLocalProfile(citizenId) {
    await new Promise(r => setTimeout(r, 55));
    const record = epanchayatMock[citizenId];
    if (!record) {
      return { found: false, error: 'Citizen not registered with rural Gram Panchayat local body' };
    }
    return {
      found: true,
      department: 'EPANCHAYAT',
      departmentName: 'e-Panchayat Rural Local Body Registry',
      rawPayload: { ...record },
      fetchedAt: new Date().toISOString()
    };
  }
}

class MaitriService {
  static async getIndustrialServices(citizenId) {
    await new Promise(r => setTimeout(r, 90));
    const record = maitriMock[citizenId];
    if (!record) {
      return { found: false, error: 'No MSME single-window clearance record found' };
    }
    return {
      found: true,
      department: 'MAITRI',
      departmentName: 'MAITRI Industrial Single Window Registry',
      rawPayload: { ...record },
      fetchedAt: new Date().toISOString()
    };
  }
}

module.exports = {
  AapleSarkarService,
  MahaDbtService,
  MahaBhulekhService,
  EPanchayatService,
  MaitriService
};
