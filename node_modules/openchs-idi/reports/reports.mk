
org_admin_name:=
report-program:=
report-encounter:=
report-spreadout:=false
#report-item-type Registration|ProgramEncounter
report-item-type:=ProgramEncounter

_reprot-post-body:={ \
	"program": $(if $(report-program),"$(report-program)",null), \
	"encounterType": $(if $(report-encounter),"$(report-encounter)",null), \
	"spreadMultiSelectObs": $(report-spreadout), \
	"type": "$(report-item-type)" }

_report-make-request:
	-rm -rf ./tmp
	-mkdir -p ./tmp
	@echo '$(_reprot-post-body)'
	@echo '$(_reprot-post-body)' | \
		curl -X POST 'http://localhost:8021/query' -d @- \
		-H "Content-Type: application/json"  \
		-H "USER-NAME: $(org_admin_name)" > ./tmp/out.json
	@echo

generate-reports:
	make _report-make-request
	node ./node_modules/openchs-idi/reports/writeToIndividualFiles.js
