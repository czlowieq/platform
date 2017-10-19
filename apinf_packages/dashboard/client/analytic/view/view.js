/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Template } from 'meteor/templating';

// Meteor contributed packages imports
import { FlowRouter } from 'meteor/kadira:flow-router';

// APInf imports
import {
  arrowDirection,
  percentageValue,
  summaryComparing,
  calculateTrend,
} from '/apinf_packages/dashboard/lib/trend_helpers';

Template.apiAnalyticView.onCreated(function () {
  const instance = this;

  instance.totalNumberBucket = new ReactiveVar({});
  instance.comparisonBucket = new ReactiveVar({});
  instance.statusCodesData = new ReactiveVar({});

  instance.autorun(() => {
    const totalNumberData = Template.currentData().totalNumberData;
    if (totalNumberData) {
      const totalNumberBucket = {};
      const comparisonBucket = {};

      const currentPeriodData = totalNumberData.group_by_interval.buckets.currentPeriod;
      totalNumberBucket.requestNumber = currentPeriodData.doc_count;
      totalNumberBucket.responseTime =
        parseInt(currentPeriodData.median_response_time.values['50.0'], 10);
      totalNumberBucket.uniqueUsers = currentPeriodData.unique_users.buckets.length;

      instance.totalNumberBucket.set(totalNumberBucket);

      const previousPeriodData = totalNumberData.group_by_interval.buckets.previousPeriod;

      const previousResponseTime = previousPeriodData.median_response_time.values['50.0'];
      const previousUniqueUsers = previousPeriodData.unique_users.buckets.length;

      // Get the statistics comparing between previous and current periods
      comparisonBucket.compareRequests =
        calculateTrend(previousPeriodData.doc_count, totalNumberBucket.requestNumber);
      comparisonBucket.compareResponse =
        calculateTrend(parseInt(previousResponseTime, 10), totalNumberBucket.responseTime);
      comparisonBucket.compareUsers =
        calculateTrend(previousUniqueUsers, totalNumberBucket.uniqueUsers);

      instance.comparisonBucket.set(comparisonBucket);
    }
  });

  instance.autorun(() => {
    // Get ES data
    const statusCodesData = Template.currentData().statusCodesData;

    const statusCodes = {};

    statusCodes.successCallsCount = statusCodesData.response_status.buckets.success.doc_count;
    statusCodes.redirectCallsCount = statusCodesData.response_status.buckets.redirect.doc_count;
    statusCodes.failCallsCount = statusCodesData.response_status.buckets.fail.doc_count;
    statusCodes.errorCallsCount = statusCodesData.response_status.buckets.error.doc_count;

    instance.statusCodesData.set(statusCodes);
  })
});

Template.apiAnalyticView.helpers({
  arrowDirection (parameter) {
    // Provide compared data
    return arrowDirection(parameter, this);
  },
  percentages (parameter) {
    // Provide compared data
    return percentageValue(parameter, this);
  },
  summaryComparing (parameter) {
    // Get value of timeframe
    const currentTimeframe = FlowRouter.getQueryParam('timeframe');

    // Provide compared data
    return summaryComparing(parameter, this, currentTimeframe);
  },
  timelineData () {
    // Get ES data
    const elasticsearchData = Template.currentData().elasticsearchData;
    const currentPeriodData = elasticsearchData.group_by_interval.buckets.currentPeriod;

    return currentPeriodData.group_by_request_path.buckets;
  },
  mostFrequentUsers () {
    // Get ES data
    const frequentUsersData = Template.currentData().frequentUsersData;

    return frequentUsersData.most_frequent_users.buckets;
  },
  overviewChartBucket () {
    const overviewChartData = Template.currentData().overviewChartData;

    return overviewChartData ? overviewChartData.requests_over_time.buckets : [];
  },
  totalNumberBucket () {
    return Template.instance().totalNumberBucket.get();
  },
  comparisonBucket () {
    return Template.instance().comparisonBucket.get();
  },
  timelineChartsBucket () {
    const timelineChartsData = Template.currentData().timelineChartsData;

    return timelineChartsData.group_by_request_path.buckets;
  },
  responseStatusCodes () {
    return Template.instance().statusCodesData.get();
  },
  errorsStatisticData () {
    const errorsStatisticData = Template.currentData().errorsStatisticData;

    return errorsStatisticData.errors_over_time.buckets;
  }
});

