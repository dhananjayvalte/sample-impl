# Implementation Deployment Interface

Example Implementation:

* [Gruntfile.js](https://github.com/OpenCHS/ihmp/blob/master/Gruntfile.js)
* [Makefile](https://github.com/OpenCHS/ihmp/blob/master/Makefile)

Both are needed. Makefile provided by openchs-idi is a thin wrapper to provide quick bash auto complete.

## To Install the sdk in an Implementation:
```
npm add github:openchs/openchs-idi#sdkcommitID             -- sdkcommitID = latest commit in master branch
npm add github:openchs/rules-config#rulescommitID          -- rulescommitID = latest commit in build branch
```

## Reports generation:
Make sure to set variable `org_admin_name:=` in the implementation Makefile after including IDI makefile.
```
make generate-reports [...options]
```

### Options:

|Option|Values|Default|Description|
|-|-|-|-|
|report-program|OperationalProgramName|Mandatory| Name of the Program for which all the reports to be generated |
|report-encounter|OperationalEncounterType|null| Name of the Encounter for which all the reports to be generated. If not mentioned, reports for all the Encounters of the given Program will be generated. |
|report-spreadout|true \| false|false| Whether or not to show multiselect Observations in multiple columns with Yes\|No as answers. Use true for multiple cols|
|report-item-type|Registration \| ProgramEncounter|ProgramEncounter| ProgramEncounter= Generate reports for prorgrams and encounter, Registration= generate a single report for registration.|

### Example:
This command will generate sql files in the ./tmp directory from where it is called.

```
make generate-reports report-program=Pregnancy report-item-type=ProgramEncounter
```

for Registration report

```
make generate-reports report-item-type=Registration
```
