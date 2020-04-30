
hello:; @echo world

su:=$(shell id -un)

#{taskDefinitionsPerENV}

create_org:
ifneq (,$(wildcard ./create_organisation.sql))
	psql -U$(su) -d openchs < ./create_organisation.sql
else
	@echo
endif

create_views:; psql -U$(su) -d openchs < create_views.sql

-include ./node_modules/openchs-idi/reports/reports.mk
