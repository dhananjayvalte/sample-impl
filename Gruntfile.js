const rulesConfigInfra = require("rules-config/infra");
const IDI = require("openchs-idi");

module.exports = IDI.configure(
  {
    name: "sampleOrg",
    "chs-admin": "admin",
    "org-name": "sampleOrg",
    "org-admin": "admin@sampleOrg",
    secrets: "../secrets.json",
    files: {
      adminUsers: {
        dev: ["users/admin-user.json"],
        // staging: ["users/admin-user.json"]
      },
      forms: [
        "forms/Registration.json"
      ],
      formMappings: ["metadata/formMappings.json"],
      formDeletions: [],
      formAdditions: [],
      catchments: [],
      checklistDetails: [
        
      ],
      concepts: [ "concepts.json"
              ],
      locations: [],
      programs: [],
      encounterTypes: [],
      operationalEncounterTypes: [],
      operationalPrograms: [],
      subjectTypes: ["subjectTypes.json"],
      operationalSubjectTypes: ["metadata/operationalSubjectTypes.json"],
      users: {
        // dev: ["users/dev-users.json"],
        // staging: ["users/dev-users.json"]
      },
      rules: ["./rules.js"],
      organisationSql: [
        /* "create_organisation.sql"*/
      ],
      organisationConfig: ["organisationConfig.json"],
      translations: ["translations/en.json"]
    }
  },
  rulesConfigInfra
);
