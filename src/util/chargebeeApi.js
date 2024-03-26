  import axios from "axios";
  import { apiBaseUrl } from "./api";
  
  //**Constants */
  const BASIC_STUDENT_PLAN_ID = "Basic-Student-Plan-USD-Monthly";
  const STANDARD_STUDENT_PLAN_ID = "Standard-Student-Plan-USD-Monthly";
  const PREMIUM_STUDENT_PLAN_ID = "Premium-Student-Plan-USD-Monthly";
  const DAILY_STUDENT_PLAN_ID = "Daily-Student-Plan-USD-Daily";
  const PRO_QUARTERLY_PLAN_ID = "Professional-Quarter-Plan-USD-Monthly";
  const PRO_BIANNUALLY_PLAN_ID = "Professional-Biannual-Plan-USD-Monthly";
  const PRO_YEARLY_PLAN_ID = "Professional-Year-Plan-USD-Monthly";
  const PLAN_ACTIVE = "active";
  const PLAN_CANCELLED = "cancelled";

  const BASIC_STUDENT_PLAN_CREDIT = 10;
  const STANDARD_STUDENT_PLAN_CREDIT = 20;
  const PREMIUM_STUDENT_PLAN_CREDIT = 30;
  const DAILY_STUDENT_PLAN_CREDIT = 1;

  //** CHAREGBEE EVENT TYPES FROM WEBHOOK
  const SUBSCRIPTION_CANCELLED = "subscription_cancelled";
  const SUBSCRIPTION_RENEWED = "subscription_renewed";

  //** CUSTOM EVENT TYPES
  const TRANSACTION_ACCEPTED = "transaction_accepted";
  const SUBSCRIPTION_REACTIVATED = "subscription_reactivated";
  const SUBSCRIPTION_CREATED = "subscription_created";
  const SUBSCRIPTION_PLAN_CHANGED = "subscription_plan_changed";
  const FIRST_REVIEW_BONUS = "first-review-bonus";


  //* Helper Functions**************************************************************/
  const getUrl = (path) => `${apiBaseUrl()}/api/chargebee/${path}`;
  const urlEncode = function(data) {
    console.log(data);
    var str = [];
    for (var p in data) {
        if (data.hasOwnProperty(p) && (!(data[p] === undefined || data[p] === null))) {
            str.push(encodeURIComponent(p) + "=" + (data[p] ? encodeURIComponent(data[p]) : ""));
        }
    }
    console.log(str.join("&"),'ram');
    return str.join("&");
  }

  const handleError = e => {
    if(e?.response) console.log(e.response, "Error.Response");
    else console.log(e, "Error");
    return Promise.reject(e);
  }

  export const getChargebeeConstants = () => {
    return {
      BASIC_STUDENT_PLAN_ID,
      STANDARD_STUDENT_PLAN_ID,
      PREMIUM_STUDENT_PLAN_ID,
      PRO_QUARTERLY_PLAN_ID,
      PRO_BIANNUALLY_PLAN_ID,
      PRO_YEARLY_PLAN_ID,
      PLAN_ACTIVE,
      PLAN_CANCELLED,
      BASIC_STUDENT_PLAN_CREDIT,
      STANDARD_STUDENT_PLAN_CREDIT,
      PREMIUM_STUDENT_PLAN_CREDIT,
      DAILY_STUDENT_PLAN_ID,
      DAILY_STUDENT_PLAN_CREDIT
    }
  }
  
  export const getEventTypes = () => ({
    SUBSCRIPTION_CANCELLED,
    TRANSACTION_ACCEPTED,
    SUBSCRIPTION_REACTIVATED,
    SUBSCRIPTION_CREATED,
    SUBSCRIPTION_PLAN_CHANGED,
    SUBSCRIPTION_RENEWED,
    FIRST_REVIEW_BONUS
  })

  export const getChargebeePlanName = (planId) => {
    switch(planId){
      case BASIC_STUDENT_PLAN_ID: 
        return 'Basic Plan';
      case STANDARD_STUDENT_PLAN_ID: 
        return 'Standard Plan';
      case PREMIUM_STUDENT_PLAN_ID:
        return 'Premium Plan';
      case DAILY_STUDENT_PLAN_ID: 
        return 'Daily Plan';
      case PRO_QUARTERLY_PLAN_ID: 
        return 'Quarterly Plan';
      case PRO_BIANNUALLY_PLAN_ID: 
        return 'Biannual Plan';
      case PRO_YEARLY_PLAN_ID:
        return 'Yearly Plan';
    }
  }

  export const getPortalSessions = () => {
    return {
      SUBSCRIPTION_DETAILS: "sub_details",
      SUBSCRIPTION_CANCELLATION: "sub_cancel",
      EDIT_SUBSCRIPTION: "edit_subscription",
      VIEW_SCHEDULED_CHANGES: "scheduled_changes",
      ACCOUNT_DETAILS: "account_details",
      EDIT_ACCOUNT_DETAILS: "portal_edit_account",
      ADDRESS: "portal_address",
      EDIT_BILLING_ADDRESS: "portal_edit_billing_address",
      EDIT_SHIPPING_ADDRESS: "portal_edit_shipping_address",
      EDIT_SUBSCRIPTION_CUSTOM_FIELDS: "portal_edit_subscription_cf",
      PAYMENT_SOURCES: "portal_payment_methods",
      ADD_PAYMENT_SOURCE: "portal_add_payment_method",
      EDIT_PAYMENT_SOURCE: "portal_edit_payment_method",
      VIEW_PAYMENT_SOURCE: "portal_view_payment_method",
      CHOOSE_PAYMENT_METHOD_FOR_SUBSCRIPTION: "portal_choose_payment_method",
      BILLING_HISTORY: "portal_billing_history"
    }
  }

  export const getDefaultCreditForPlan = planId => {

    switch(planId){
      case BASIC_STUDENT_PLAN_ID:
        return BASIC_STUDENT_PLAN_CREDIT;
      case STANDARD_STUDENT_PLAN_ID: 
        return STANDARD_STUDENT_PLAN_CREDIT;
      case PREMIUM_STUDENT_PLAN_ID:
        return PREMIUM_STUDENT_PLAN_CREDIT;
      case DAILY_STUDENT_PLAN_ID:
        return DAILY_STUDENT_PLAN_CREDIT;
    }

  }

  export const getSubscriptionPlanData = (subscriptions) => {

    const subscriptionData = subscriptions?.map?.(obj => {
      const { subscription } = obj;
      const subId = subscription.id;
      const status = subscription.status;
      const planId = subscription.subscription_items[0].item_price_id;
      const current_term_end = subscription.current_term_end;
      return {
        status,
        planId,
        subId,
        current_term_end
      }
    })
  
    let planId = null;
    let planStatus = null;
    let subId = null;
    let current_term_end = null;

    if(subscriptionData?.length){
      planId = subscriptionData[0].planId; 
      planStatus = subscriptionData[0].status;
      subId = subscriptionData[0].subId,
      current_term_end = subscriptionData[0].current_term_end
    }

    return {
      planId,
      planStatus,
      subId,
      current_term_end
    }
  }

  export const getDisplayData = (subscriptionData) => {
    const SUBSCRIBED = "Subscribed";
    const UPGRADE = "Upgrade";
    const DOWNGRADE = "Downgrade";
    const CANCELLED = 'Cancelled';
    const { planId, planStatus } = subscriptionData;
    let [ basicStuPlanBtn, standardStuPlanBtn, premiumStuPlanBtn, 
          quarterProPlanBtn, biannualProPlanBtn, yearProPlanBtn ] = Array(6).fill("Subscribe");
    const isActive = planStatus === PLAN_ACTIVE;
    const cancelBtn = isActive ? "Cancel" : "Reactivate";

    switch(planId){
      case BASIC_STUDENT_PLAN_ID: {
        basicStuPlanBtn = isActive ? SUBSCRIBED : CANCELLED;
        standardStuPlanBtn = premiumStuPlanBtn = UPGRADE;
        break;
      }
      case STANDARD_STUDENT_PLAN_ID: {
        basicStuPlanBtn = DOWNGRADE;
        standardStuPlanBtn = isActive ? SUBSCRIBED : CANCELLED;
        premiumStuPlanBtn = UPGRADE;
        break;
      }
      case PREMIUM_STUDENT_PLAN_ID: {
        basicStuPlanBtn = standardStuPlanBtn = DOWNGRADE;
        premiumStuPlanBtn = isActive ? SUBSCRIBED : CANCELLED;
        break;
      }
      case PRO_QUARTERLY_PLAN_ID: {
        quarterProPlanBtn = isActive ? SUBSCRIBED : CANCELLED;
        biannualProPlanBtn = yearProPlanBtn = UPGRADE;
        break;
      }
      case PRO_BIANNUALLY_PLAN_ID: {
        quarterProPlanBtn = DOWNGRADE;
        biannualProPlanBtn = isActive ? SUBSCRIBED : CANCELLED;
        yearProPlanBtn = UPGRADE;
        break;
      }
      case PRO_YEARLY_PLAN_ID: {
        yearProPlanBtn = isActive ? SUBSCRIBED : CANCELLED;
        quarterProPlanBtn = biannualProPlanBtn = DOWNGRADE;
        break;
      }
    }

    return {
      basicStuPlanBtn,
      standardStuPlanBtn,
      premiumStuPlanBtn,

      quarterProPlanBtn,
      biannualProPlanBtn,
      yearProPlanBtn,

      cancelBtn
    }
  } 

  export const getUsefulDataFromInvoices = invoicesArr => {
    return invoicesArr?.map(invoiceObj => {
      const { invoice } = invoiceObj;
      const { id, status, date, total, amount_paid, credits_applied, currency_code, line_items } = invoice;
      const { entity_id, entity_description, description } = line_items?.[0] || {}
      return {
        id,
        status,
        date,
        total,
        amount_paid,
        credits_applied,
        currency_code,
        entity_id,
        entity_description,
        description
      } 
    })
  }
  //************************************************** */
  export const subscribe = body => {
    
    return axios.post(getUrl('generate_checkout_new_url'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError);
  };

  export const createPortalSession = body => {
   
    return axios.post(getUrl('generate_portal_session'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError);
  }

  export const getSubscriptionInfo = body => {

    return axios.post(getUrl('get-subscription-info'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError);
  }

  export const checkoutExisting = body => {
    return axios.post(getUrl('generate_checkout_existing_url'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError)
  }

  export const retrieveHostedPage = body => {
    return axios.post(getUrl('retrieve-hosted-page'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError)
  }

  export const getSavedCards = body => {
    return axios.post(getUrl('get-saved-cards'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError)
  }

  export const getChargebeeTransactions = body => {
    return axios.post(getUrl('get-chargebee-transactions'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError)
  }

  export const getChargebeeInvoices = body => {
    return axios.post(getUrl('get-chargebee-invoices'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError)
  }

  export const postCreateCustomer = body => {
    console.log('bodyyyy',body);
    return axios.post(getUrl('create-customer'), urlEncode(body))
                .then(response => response.data)
                .catch(handleError)
  }