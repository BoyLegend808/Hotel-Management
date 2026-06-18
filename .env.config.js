// Environment Configuration

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const DEMO_USERS = [
  {
    username: "admin",
    passwords: ["demo1234"],
    role: "admin",
    name: "Admin User",
    redirect: "/pages/admin/dashboard"
  },
  {
    username: "staffnurse",
    passwords: ["demo1234"],
    role: "staff",
    name: "Nurse Staff",
    residentId: null,
    redirect: "/pages/staff-portal/dashboard"
  },
  {
    username: "henderson",
    passwords: ["demo1234"],
    role: "family",
    name: "Henderson Family",
    residentId: "RES001",
    redirect: "/pages/family-portal/dashboard"
  }
];

module.exports = {
  SESSION_TTL_MS,
  DEMO_USERS
};
