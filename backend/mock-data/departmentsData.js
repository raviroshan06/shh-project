// Mock datasets for 5 disconnected government departments
// Notice intentional diversity of keys: citizenName vs full_name vs owner_name vs name

const aapleSarkarMock = {
  "MH-CIT-1001": {
    citizenName: "Ravi Shankar Kumar",
    contactNum: "+91 9876543210",
    birthDate: "15/08/1995",
    dist: "Pune",
    residence: "Flat 402, Shivneri Appts, Kothrud",
    domicileCertNo: "MH-DOM-2021-99881",
    prabhagNo: "Ward 14",
    status: "ACTIVE"
  },
  "MH-CIT-1002": {
    citizenName: "Anita Ramesh Patil",
    contactNum: "+91 9822012345",
    birthDate: "12/04/1992",
    dist: "Kolhapur",
    residence: "Plot 12, Tarabai Park, Kolhapur",
    domicileCertNo: "MH-DOM-2019-33214",
    prabhagNo: "Ward 03",
    status: "ACTIVE"
  },
  "MH-CIT-1003": {
    citizenName: "Suresh Bapu Jadhav",
    contactNum: "+91 9423198765",
    birthDate: "20/11/1984",
    dist: "Satara",
    residence: "At Post Karad, Near Bus Stand",
    domicileCertNo: "MH-DOM-2018-11200",
    prabhagNo: "Ward 07",
    status: "ACTIVE"
  },
  "MH-CIT-1004": {
    citizenName: "Priya Nilesh Deshmukh",
    contactNum: "+91 9158098765",
    birthDate: "05/06/1998",
    dist: "Nagpur",
    residence: "House 24, Dharampeth, Nagpur",
    domicileCertNo: "MH-DOM-2022-77610",
    prabhagNo: "Ward 22",
    status: "ACTIVE"
  },
  "MH-CIT-1005": {
    citizenName: "Amit Vasant Shinde",
    contactNum: "+91 9765432109",
    birthDate: "10/01/1990",
    dist: "Nashik",
    residence: "B-12 Panchavati Colony, Nashik",
    domicileCertNo: "MH-DOM-2020-55412",
    prabhagNo: "Ward 09",
    status: "ACTIVE"
  }
};

const mahaDbtMock = {
  "MH-CIT-1001": {
    full_name: "Ravi S. Kumar", // Intentional middle initial -> name mismatch demonstration
    mobile_number: "9876543210",
    dob: "1995-08-15",
    district_name: "PUNE",
    address_line: "Flat 402, Shivneri Appts, Kothrud",
    applicant_id: "DBT-2025-4491",
    scholarship_status: "ELIGIBLE",
    caste_category: "OBC",
    annual_family_income: 180000
  },
  "MH-CIT-1002": {
    full_name: "Anita Ramesh Patil",
    mobile_number: "9822012345",
    dob: "1992-04-12",
    district_name: "KOLHAPUR",
    address_line: "Flat 301, Rajaram Puri 5th Lane, Kolhapur", // Address mismatch scenario!
    applicant_id: "DBT-2024-8891",
    scholarship_status: "BENEFICIARY_ACTIVE",
    caste_category: "GENERAL",
    annual_family_income: 320000
  },
  // Citizen 1003 is INTENTIONALLY MISSING from MahaDBT to demonstrate "Missing Department Record" scenario
  "MH-CIT-1004": {
    full_name: "Priya Nilesh Deshmukh", // Perfectly matches Aaple Sarkar
    mobile_number: "9158098765",
    dob: "1998-06-05",
    district_name: "NAGPUR",
    address_line: "House 24, Dharampeth, Nagpur",
    applicant_id: "DBT-2023-1102",
    scholarship_status: "VERIFIED",
    caste_category: "SC",
    annual_family_income: 120000
  },
  "MH-CIT-1005": {
    full_name: "Amit V. Shinde", // Name mismatch
    mobile_number: "9765432100", // Mobile mismatch! (Ending in 00 instead of 09)
    dob: "1990-01-10",
    district_name: "NASHIK",
    address_line: "C-44 Gangapur Road, Nashik", // Address mismatch!
    applicant_id: "DBT-2022-7719",
    scholarship_status: "FLAGGED_INCONSISTENT",
    caste_category: "EWS",
    annual_family_income: 210000
  }
};
const mahabhulekhMock = {
  "MH-CIT-1001": {
    owner_name: "RAVI SHANKAR KUMAR",
    khata_no: "KH-Pune-8812",
    survey_gut_number: "142/3B",
    village: "Baramati Rural",
    district: "Pune",
    land_record_status: "VERIFIED_7_12",
    total_area_hectares: 1.45,
    cultivable_area: 1.20
  },
  "MH-CIT-1002": {
    owner_name: "ANITA RAMESH PATIL",
    khata_no: "KH-Kol-4412",
    survey_gut_number: "88/1",
    village: "Shirol",
    district: "Kolhapur",
    land_record_status: "VERIFIED_7_12",
    total_area_hectares: 0.85,
    cultivable_area: 0.85
  },
  "MH-CIT-1003": {
    owner_name: "SURESH BAPU JADHAV",
    khata_no: "KH-Sat-9901",
    survey_gut_number: "204/2",
    village: "Karad Rural",
    district: "Satara",
    land_record_status: "VERIFIED_7_12",
    total_area_hectares: 3.10,
    cultivable_area: 2.80
  },
  "MH-CIT-1004": {
    owner_name: "PRIYA NILESH DESHMUKH",
    khata_no: "KH-Nag-1205",
    survey_gut_number: "55/4",
    village: "Hingna",
    district: "Nagpur",
    land_record_status: "VERIFIED_7_12",
    total_area_hectares: 0.50,
    cultivable_area: 0.40
  },
  "MH-CIT-1005": {
    owner_name: "AMIT SHINDE",
    khata_no: "KH-Nas-7711",
    survey_gut_number: "91/1A",
    village: "Dindori",
    district: "Nashik",
    land_record_status: "MUTATION_PENDING",
    total_area_hectares: 2.25,
    cultivable_area: 2.00
  }
};

const epanchayatMock = {
  "MH-CIT-1001": {
    name: "Ravi Kumar",
    registered_mobile: "9876543210",
    gram_panchayat: "Baramati Rural",
    village: "Baramati",
    district: "Pune",
    house_tax_assessment_no: "GP-BMT-2024-81",
    local_certificate_status: "ISSUED",
    ration_card_category: "APL"
  },
  "MH-CIT-1002": {
    name: "Anita Ramesh Patil",
    registered_mobile: "9822012345",
    gram_panchayat: "Shirol Gram Panchayat",
    village: "Shirol",
    district: "Kolhapur",
    house_tax_assessment_no: "GP-SHR-2023-19",
    local_certificate_status: "ISSUED",
    ration_card_category: "BPL"
  },
  "MH-CIT-1003": {
    name: "Suresh Jadhav",
    registered_mobile: "9423198765",
    gram_panchayat: "Karad Gram Panchayat",
    village: "Karad Rural",
    district: "Satara",
    house_tax_assessment_no: "GP-KRD-2022-55",
    local_certificate_status: "ISSUED",
    ration_card_category: "APL"
  },
  "MH-CIT-1004": {
    name: "Priya Nilesh Deshmukh",
    registered_mobile: "9158098765",
    gram_panchayat: "Hingna Rural",
    village: "Hingna",
    district: "Nagpur",
    house_tax_assessment_no: "GP-HNG-2024-02",
    local_certificate_status: "ISSUED",
    ration_card_category: "BPL"
  },
  "MH-CIT-1005": {
    name: "A. V. Shinde",
    registered_mobile: "9765432109",
    gram_panchayat: "Dindori Gram Panchayat",
    village: "Dindori",
    district: "Nashik",
    house_tax_assessment_no: "GP-DND-2021-41",
    local_certificate_status: "PENDING_VERIFICATION",
    ration_card_category: "APL"
  }
};

const maitriMock = {
  "MH-CIT-1001": {
    applicant_name: "Ravi Shankar Kumar",
    business_name: "Sahyadri Agro Processing LLP",
    udyam_registration: "UDYAM-MH-26-009812",
    district: "Pune",
    application_status: "CLEARANCE_GRANTED",
    category: "Small Enterprise"
  },
  "MH-CIT-1002": {
    applicant_name: "Anita Patil",
    business_name: "Kolhapur Traditional Textiles",
    udyam_registration: "UDYAM-MH-19-004519",
    district: "Kolhapur",
    application_status: "UNDER_SCRUTINY",
    category: "Micro Enterprise"
  },
  "MH-CIT-1003": {
    applicant_name: "Suresh Bapu Jadhav",
    business_name: "Krishna Valley Cold Storage",
    udyam_registration: "UDYAM-MH-31-002214",
    district: "Satara",
    application_status: "NOC_PENDING_FIRE",
    category: "Small Enterprise"
  },
  "MH-CIT-1004": {
    applicant_name: "Priya Nilesh Deshmukh",
    business_name: "Vidarbha Bio-Tech Solutions",
    udyam_registration: "UDYAM-MH-08-001928",
    district: "Nagpur",
    application_status: "CLEARANCE_GRANTED",
    category: "Micro Enterprise"
  },
  "MH-CIT-1005": {
    applicant_name: "Amit Shinde",
    business_name: "Godavari Logistics Hub",
    udyam_registration: "UDYAM-MH-20-008172",
    district: "Nashik",
    application_status: "SUBMITTED",
    category: "Medium Enterprise"
  }
};


module.exports = {
  aapleSarkarMock,
  mahaDbtMock,
  mahabhulekhMock,
  epanchayatMock,
  maitriMock
};
