import {
  StatusBuilderAnnotationFactory, 
  RuleFactory,  
  FormElementsStatusHelper,
  WithName
} from 'rules-config/rules';

const filter = RuleFactory('b795aae4-8930-11ea-bc55-0242ac130003', 'ViewFilter');
const WithStatusBuilder = StatusBuilderAnnotationFactory('programEnrolment', 'formElement');
const WithRegistrationStatusBuilder = StatusBuilderAnnotationFactory('individual', 'formElement');

@filter('b795abac-8930-11ea-bc55-0242ac130003', 'UniqueClassName', 100.0)
class UniqueClassName {
  static exec(programEnrolment, formElementGroup, today) {
      return FormElementsStatusHelper
          .getFormElementsStatusesWithoutDefaults(new UniqueClassName(), programEnrolment, formElementGroup, today);
  }    

}




module.exports = {UniqueClassName};