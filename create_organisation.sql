select create_db_user('sampleOrg', 'password');

INSERT into organisation (name, db_user, uuid, parent_organisation_id,media_directory)
values ('sampleOrg',
        'sampleOrg', 'b795aa12-8930-11ea-bc55-0242ac130003', null,'sampleOrg');
