const BaseDepartmentAdapter = require('./baseAdapter');
const {
  AapleSarkarService,
  MahaDbtService,
  MahaBhulekhService,
  EPanchayatService,
  MaitriService
} = require('./departmentServices');

class AapleSarkarAdapter extends BaseDepartmentAdapter {
  constructor() {
    super('AAPLE_SARKAR', 'Aaple Sarkar Citizen Services Registry');
  }

  async fetchData(citizenId) {
    const res = await AapleSarkarService.getCitizenProfile(citizenId);
    if (!res.found) return { success: false, error: res.error, code: this.departmentCode };
    return {
      success: true,
      code: this.departmentCode,
      name: this.departmentName,
      raw: res.rawPayload,
      canonical: this.normalize(res.rawPayload)
    };
  }

  normalize(raw) {
    let dob = raw.birthDate || '';
    if (dob.includes('/')) {
      const [d, m, y] = dob.split('/');
      dob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return {
      canonical_name: raw.citizenName ? raw.citizenName.trim() : '',
      mobile: raw.contactNum ? raw.contactNum.replace(/\s+/g, '') : '',
      date_of_birth: dob,
      address: raw.residence || '',
      district: raw.dist || '',
      village: '',
      specific_attributes: {
        domicileCertNo: raw.domicileCertNo,
        prabhagNo: raw.prabhagNo,
        status: raw.status
      }
    };
  }
}

class MahaDbtAdapter extends BaseDepartmentAdapter {
  constructor() {
    super('MAHADBT', 'MahaDBT Direct Benefit Transfer');
  }

  async fetchData(citizenId) {
    const res = await MahaDbtService.getScholarshipsAndBenefits(citizenId);
    if (!res.found) return { success: false, error: res.error, code: this.departmentCode };
    return {
      success: true,
      code: this.departmentCode,
      name: this.departmentName,
      raw: res.rawPayload,
      canonical: this.normalize(res.rawPayload)
    };
  }

  normalize(raw) {
    const dist = raw.district_name ? raw.district_name.charAt(0).toUpperCase() + raw.district_name.slice(1).toLowerCase() : '';
    return {
      canonical_name: raw.full_name ? raw.full_name.trim() : '',
      mobile: raw.mobile_number ? (raw.mobile_number.startsWith('+91') ? raw.mobile_number : `+91${raw.mobile_number}`) : '',
      date_of_birth: raw.dob || '',
      address: raw.address_line || '',
      district: dist,
      village: '',
      specific_attributes: {
        applicantId: raw.applicant_id,
        scholarshipStatus: raw.scholarship_status,
        casteCategory: raw.caste_category,
        annualIncome: raw.annual_family_income
      }
    };
  }
}

class MahaBhulekhAdapter extends BaseDepartmentAdapter {
  constructor() {
    super('MAHABHULEKH', 'Mahabhulekh Land Records (Revenue Dept)');
  }

  async fetchData(citizenId) {
    const res = await MahaBhulekhService.getLandRecords(citizenId);
    if (!res.found) return { success: false, error: res.error, code: this.departmentCode };
    return {
      success: true,
      code: this.departmentCode,
      name: this.departmentName,
      raw: res.rawPayload,
      canonical: this.normalize(res.rawPayload)
    };
  }

  normalize(raw) {
    return {
      canonical_name: raw.owner_name ? raw.owner_name.trim() : '',
      mobile: '',
      date_of_birth: '',
      address: `${raw.village || ''}, ${raw.district || ''}`,
      district: raw.district || '',
      village: raw.village || '',
      specific_attributes: {
        khataNo: raw.khata_no,
        surveyGutNumber: raw.survey_gut_number,
        landRecordStatus: raw.land_record_status,
        totalAreaHectares: raw.total_area_hectares,
        cultivableArea: raw.cultivable_area
      }
    };
  }
}

class EPanchayatAdapter extends BaseDepartmentAdapter {
  constructor() {
    super('EPANCHAYAT', 'e-Panchayat Rural Local Body Registry');
  }

  async fetchData(citizenId) {
    const res = await EPanchayatService.getLocalProfile(citizenId);
    if (!res.found) return { success: false, error: res.error, code: this.departmentCode };
    return {
      success: true,
      code: this.departmentCode,
      name: this.departmentName,
      raw: res.rawPayload,
      canonical: this.normalize(res.rawPayload)
    };
  }

  normalize(raw) {
    return {
      canonical_name: raw.name ? raw.name.trim() : '',
      mobile: raw.registered_mobile ? (raw.registered_mobile.startsWith('+91') ? raw.registered_mobile : `+91${raw.registered_mobile}`) : '',
      date_of_birth: '',
      address: `${raw.village || ''}, GP: ${raw.gram_panchayat || ''}`,
      district: raw.district || '',
      village: raw.village || '',
      specific_attributes: {
        gramPanchayat: raw.gram_panchayat,
        houseTaxNo: raw.house_tax_assessment_no,
        certificateStatus: raw.local_certificate_status,
        rationCategory: raw.ration_card_category
      }
    };
  }
}

class MaitriAdapter extends BaseDepartmentAdapter {
  constructor() {
    super('MAITRI', 'MAITRI Industrial Single Window Registry');
  }

  async fetchData(citizenId) {
    const res = await MaitriService.getIndustrialServices(citizenId);
    if (!res.found) return { success: false, error: res.error, code: this.departmentCode };
    return {
      success: true,
      code: this.departmentCode,
      name: this.departmentName,
      raw: res.rawPayload,
      canonical: this.normalize(res.rawPayload)
    };
  }

  normalize(raw) {
    return {
      canonical_name: raw.applicant_name ? raw.applicant_name.trim() : '',
      mobile: '',
      date_of_birth: '',
      address: `${raw.district || ''}, Maharashtra`,
      district: raw.district || '',
      village: '',
      specific_attributes: {
        businessName: raw.business_name,
        udyamRegistration: raw.udyam_registration,
        applicationStatus: raw.application_status,
        category: raw.category
      }
    };
  }
}

module.exports = {
  AapleSarkarAdapter: new AapleSarkarAdapter(),
  MahaDbtAdapter: new MahaDbtAdapter(),
  MahaBhulekhAdapter: new MahaBhulekhAdapter(),
  EPanchayatAdapter: new EPanchayatAdapter(),
  MaitriAdapter: new MaitriAdapter()
};
