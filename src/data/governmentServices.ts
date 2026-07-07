export interface GovernmentService {
  id: string;
  name: string;
  category: string;
  description: string;
  summary: string;
  eligibility: string[];
  requiredDocuments: string[];
  fees: string;
  processingTime: string;
  steps: string[];
  faqs: Array<{ question: string; answer: string }>;
  officialWebsite: string;
  featured?: boolean;
  popular?: boolean;
  recent?: boolean;
  saved?: boolean;
}

export const governmentServices: GovernmentService[] = [
  {
    id: "aadhaar",
    name: "Aadhaar",
    category: "Identity",
    description: "Unique identity proof for residents of India.",
    summary: "Aadhaar helps citizens access subsidies, benefits, and identity verification across services.",
    eligibility: ["Indian resident", "Age 5 and above for regular enrollment", "Valid proof of identity and address"],
    requiredDocuments: ["Proof of identity", "Proof of address", "Birth certificate if applicable"],
    fees: "Free for enrollment and update",
    processingTime: "15 to 30 days",
    steps: ["Book an appointment", "Visit Aadhaar Seva Kendra", "Complete biometric verification", "Download e-Aadhaar"],
    faqs: [
      { question: "Is Aadhaar mandatory?", answer: "It is widely used but not universally mandatory for every service." },
      { question: "Can I update my address?", answer: "Yes, you can update your address online or at a center." }
    ],
    officialWebsite: "https://uidai.gov.in",
    featured: true,
    popular: true
  },
  {
    id: "pan",
    name: "PAN Card",
    category: "Identity",
    description: "Tax identification number issued by the Income Tax Department.",
    summary: "PAN is used for tax filing, financial transactions, and KYC compliance.",
    eligibility: ["Indian taxpayer", "Any resident or non-resident with taxable income"],
    requiredDocuments: ["Proof of identity", "Proof of address", "Date of birth proof"],
    fees: "₹107 for Indian communication address",
    processingTime: "15 days",
    steps: ["Fill application form", "Submit identity proof", "Pay fee", "Track PAN status"],
    faqs: [
      { question: "Who needs PAN?", answer: "Individuals and entities involved in financial transactions and tax filing." }
    ],
    officialWebsite: "https://www.tin-nsdl.com",
    popular: true
  },
  {
    id: "passport",
    name: "Passport",
    category: "Identity",
    description: "Travel document for citizens and some residents of India.",
    summary: "Passport services include fresh issuance, reissue, and Tatkaal processing.",
    eligibility: ["Indian citizen", "Valid identity and address proof"],
    requiredDocuments: ["Proof of address", "Proof of birth", "Police verification if required"],
    fees: "Varies by booklet size and service type",
    processingTime: "2 to 6 weeks",
    steps: ["Create an account", "Fill application", "Schedule appointment", "Submit biometrics"],
    faqs: [
      { question: "Can minors apply?", answer: "Yes, with guardian consent and supporting documents." }
    ],
    officialWebsite: "https://passportindia.gov.in",
    featured: true,
    popular: true
  },
  {
    id: "voter-id",
    name: "Voter ID",
    category: "Identity",
    description: "Electoral identity card issued by the Election Commission.",
    summary: "Use it to participate in elections and as identity proof in many situations.",
    eligibility: ["Indian citizen above 18 years", "Resident of the constituency"],
    requiredDocuments: ["Age proof", "Address proof", "Passport-size photograph"],
    fees: "Free",
    processingTime: "15 to 30 days",
    steps: ["Fill Form 6", "Submit address proof", "Verify application", "Collect EPIC"],
    faqs: [
      { question: "How do I correct my name?", answer: "Submit a correction request with supporting documents." }
    ],
    officialWebsite: "https://electoralsearch.in"
  },
  {
    id: "driving-licence",
    name: "Driving Licence",
    category: "Transportation",
    description: "Licence to drive motor vehicles in India.",
    summary: "Apply for a fresh licence, renew an existing one, or update credentials.",
    eligibility: ["Minimum age as per vehicle type", "Medical certificate if required"],
    requiredDocuments: ["Age proof", "Address proof", "Learner’s licence"],
    fees: "Varies by state and licence type",
    processingTime: "7 to 30 days",
    steps: ["Apply online", "Schedule test", "Appear for test", "Collect licence"],
    faqs: [
      { question: "Can I renew online?", answer: "Yes, many states offer online renewal through Sarathi." }
    ],
    officialWebsite: "https://parivahan.gov.in",
    featured: true,
    popular: true
  },
  {
    id: "vehicle-registration",
    name: "Vehicle Registration",
    category: "Transportation",
    description: "Register a motor vehicle with the regional transport office.",
    summary: "Required to legally own and operate a vehicle in India.",
    eligibility: ["Vehicle owner", "Valid sale documents"],
    requiredDocuments: ["Sale certificate", "Insurance", "Address proof", "PUC certificate"],
    fees: "Depends on vehicle type and state",
    processingTime: "1 to 2 weeks",
    steps: ["Submit form", "Pay applicable fees", "Get registration number", "Collect RC"],
    faqs: [
      { question: "Can I transfer ownership?", answer: "Yes, through the local RTO with formal transfer documents." }
    ],
    officialWebsite: "https://parivahan.gov.in"
  },
  {
    id: "birth-certificate",
    name: "Birth Certificate",
    category: "Certificates",
    description: "Official proof of birth registration.",
    summary: "Needed for school admission, passport, and other legal records.",
    eligibility: ["Child registered with authorities", "Parent or guardian"],
    requiredDocuments: ["Hospital records", "Parent identity proof", "Address proof"],
    fees: "Usually nominal or free",
    processingTime: "3 to 7 days",
    steps: ["Register birth", "Submit form", "Pay fee if applicable", "Collect certificate"],
    faqs: [
      { question: "Can I apply online?", answer: "Yes, many municipalities offer online application services." }
    ],
    officialWebsite: "https://crsorgi.gov.in",
    featured: true,
    popular: true
  },
  {
    id: "marriage-certificate",
    name: "Marriage Certificate",
    category: "Certificates",
    description: "Official record of marriage registration.",
    summary: "Useful for legal proof, visa, and benefits eligibility.",
    eligibility: ["Married couple", "Valid marriage evidence"],
    requiredDocuments: ["Marriage proof", "ID proofs", "Address proof"],
    fees: "Varies by state",
    processingTime: "7 to 14 days",
    steps: ["Register marriage", "Submit documents", "Verify details", "Collect certificate"],
    faqs: [
      { question: "Is it compulsory?", answer: "Registration is often recommended to create a legal record." }
    ],
    officialWebsite: "https://www.ndmlawpartner.com"
  },
  {
    id: "income-certificate",
    name: "Income Certificate",
    category: "Certificates",
    description: "Proof of income issued by revenue authorities.",
    summary: "Commonly required for education, scholarships, and welfare schemes.",
    eligibility: ["Resident of the local area", "Valid income source"],
    requiredDocuments: ["Income proof", "Address proof", "Identity proof"],
    fees: "Nominal fee depending on state",
    processingTime: "3 to 10 days",
    steps: ["Submit application", "Attach income proof", "Verification", "Collect certificate"],
    faqs: [
      { question: "Who issues it?", answer: "It is issued by the revenue or local administration office." }
    ],
    officialWebsite: "https://www.india.gov.in"
  },
  {
    id: "domicile-certificate",
    name: "Domicile Certificate",
    category: "Certificates",
    description: "Proof of permanent residence in a state.",
    summary: "For state quotas, scholarships, and benefits.",
    eligibility: ["Resident of the state for a required period"],
    requiredDocuments: ["Address proof", "ID proof", "Residence proof"],
    fees: "Nominal fee",
    processingTime: "7 to 15 days",
    steps: ["Apply at district office", "Submit proof", "Verification", "Collect certificate"],
    faqs: [
      { question: "How long is it valid?", answer: "Validity depends on the issuing authority and purpose." }
    ],
    officialWebsite: "https://www.india.gov.in"
  },
  {
    id: "scholarships",
    name: "Scholarships",
    category: "Education",
    description: "Financial aid for students from the government and affiliated bodies.",
    summary: "Explore scholarships for school, college, and vocational study.",
    eligibility: ["Student", "Category-specific eligibility criteria"],
    requiredDocuments: ["Identity proof", "Academic records", "Income proof"],
    fees: "Free",
    processingTime: "2 to 6 weeks",
    steps: ["Check eligibility", "Register on portal", "Upload proof", "Track application"],
    faqs: [
      { question: "Can I apply for more than one?", answer: "Yes, subject to rules and eligibility." }
    ],
    officialWebsite: "https://scholarships.gov.in",
    popular: true
  },
  {
    id: "skill-india",
    name: "Skill India",
    category: "Education",
    description: "Training and skilling initiatives for employability.",
    summary: "Helps citizens access vocational training and job-linked programmes.",
    eligibility: ["Citizen interested in skill training"],
    requiredDocuments: ["Identity proof", "Education proof"],
    fees: "Often free or subsidised",
    processingTime: "1 to 3 weeks",
    steps: ["Register on portal", "Choose course", "Complete training", "Get certification"],
    faqs: [
      { question: "Who can enroll?", answer: "Any citizen meeting the course requirements." }
    ],
    officialWebsite: "https://skillindia.gov.in"
  },
  {
    id: "startup-india",
    name: "Startup India",
    category: "Business",
    description: "Support for entrepreneurs and startups in India.",
    summary: "Access recognition, schemes, and mentorship for new ventures.",
    eligibility: ["Entrepreneur or startup founder"],
    requiredDocuments: ["Business plan", "Identity proof", "Address proof"],
    fees: "Free registration",
    processingTime: "5 to 10 days",
    steps: ["Register startup", "Upload documents", "Complete profile", "Track recognition"],
    faqs: [
      { question: "Is there a fee?", answer: "Basic recognition is free and may involve other compliance costs." }
    ],
    officialWebsite: "https://www.startupindia.gov.in"
  },
  {
    id: "msme",
    name: "MSME",
    category: "Business",
    description: "Registration and support for micro, small, and medium enterprises.",
    summary: "Use Udyam registration to access credit and government support.",
    eligibility: ["Business owner", "Valid business details"],
    requiredDocuments: ["Aadhaar", "PAN", "Business details"],
    fees: "Free",
    processingTime: "1 to 3 days",
    steps: ["Register on Udyam", "Provide business details", "Submit documents", "Download certificate"],
    faqs: [
      { question: "Is GST mandatory?", answer: "Not always, but it may be required depending on turnover and business type." }
    ],
    officialWebsite: "https://udyamregistration.gov.in"
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat",
    category: "Health",
    description: "Health insurance and hospital coverage scheme for eligible families.",
    summary: "Eligible families can access cashless treatment at empanelled hospitals.",
    eligibility: ["Eligible socio-economic household", "Valid beneficiary identification"],
    requiredDocuments: ["Aadhaar", "Ration card or family proof", "Mobile number"],
    fees: "Free for eligible beneficiaries",
    processingTime: "1 to 2 weeks",
    steps: ["Check eligibility", "Register beneficiary", "Verify data", "Use card at hospital"],
    faqs: [
      { question: "How do I check if I am eligible?", answer: "Use the official beneficiary portal with your details." }
    ],
    officialWebsite: "https://pmjay.gov.in",
    popular: true
  }
];

export const serviceCategories = [
  "All",
  "Identity",
  "Transportation",
  "Certificates",
  "Education",
  "Business",
  "Health"
];

export function getFeaturedServices() {
  return governmentServices.filter((service) => service.featured);
}

export function getPopularServices() {
  return governmentServices.filter((service) => service.popular);
}
