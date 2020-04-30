insert into gender(uuid, name, version, audit_id, is_voided, organisation_id)
select uuid_generate_v4(), 'Male', 0, create_audit((select id from users where username = 'admin@sampleOrg')), false, id
from organisation
where name = 'sampleOrg';

insert into gender(uuid, name, version, audit_id, is_voided, organisation_id)
select uuid_generate_v4(), 'Female', 0, create_audit((select id from users where username = 'admin@sampleOrg')), false, id
from organisation
where name = 'sampleOrg';

insert into gender(uuid, name, version, audit_id, is_voided, organisation_id)
select uuid_generate_v4(), 'Other', 0, create_audit((select id from users where username = 'admin@sampleOrg')), false, id
from organisation
where name = 'sampleOrg';