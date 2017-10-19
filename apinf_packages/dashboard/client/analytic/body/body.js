/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Meteor contributed packages imports
import { FlowRouter } from 'meteor/kadira:flow-router';

// Collection imports
import Proxies from '/apinf_packages/proxies/collection';
import ProxyBackends from '/apinf_packages/proxy_backends/collection';

// APInf import
import queryForOverviewCharts from '/apinf_packages/dashboard/client/overview_query';
import queryForTotalNumbers from '/apinf_packages/dashboard/client/total_number_query';
import queryForTimelineCharts from '/apinf_packages/dashboard/client/timeline_query';
import queryForStatusCodes from '/apinf_packages/dashboard/client/status_codes_query';
import queryForMostUsers from '/apinf_packages/dashboard/client/most_users_query';
import queryForErrorsStatistic from '/apinf_packages/dashboard/client/errors_statistic_query';
import queryForAnalyticPage from '../query';

Template.apiAnalyticPageBody.onCreated(function () {
  const templateInstance = this;

  templateInstance.elasticsearchData = new ReactiveVar();
  templateInstance.error = new ReactiveVar();

  templateInstance.overviewChartData = new ReactiveVar();
  templateInstance.totalNumberData = new ReactiveVar();
  templateInstance.timelineChartsData = new ReactiveVar();
  templateInstance.statusCodesData = new ReactiveVar();
  templateInstance.frequentUsersData = new ReactiveVar();
  templateInstance.errorsStatisticData = new ReactiveVar();

  templateInstance.autorun(() => {
    const proxyBackend = ProxyBackends.findOne(templateInstance.data.proxyBackendId);

    // Make sure proxy backend is available
    if (proxyBackend) {
      // Storage Proxy ID and API ID
      templateInstance.proxyId = proxyBackend.proxyId;
      templateInstance.apiId = proxyBackend.apiId;

      const proxy = Proxies.findOne(templateInstance.proxyId);

      // Make sure proxy is available
      if (proxy) {
        // Get request_path
        const proxyBackendPath = proxyBackend.apiUmbrella.url_matches[0].frontend_prefix;

        // Get timeframe
        const timeframe = FlowRouter.getQueryParam('timeframe');

        // Make query to Elasticsearch for this page
        const queryParams = queryForAnalyticPage(proxyBackendPath, timeframe);

        const overviewChartsQuery = queryForOverviewCharts(proxyBackendPath, timeframe);
        const totalNumbersQuery = queryForTotalNumbers(proxyBackendPath, timeframe);
        const timelineChartsQuery = queryForTimelineCharts(proxyBackendPath, timeframe);
        const statusCodesQuery = queryForStatusCodes(proxyBackendPath, timeframe);
        const usersQuery = queryForMostUsers(proxyBackendPath, timeframe);
        const errorsQuery = queryForErrorsStatistic(proxyBackendPath, timeframe);

        // Get URL of relevant ElasticSearch
        const elasticsearchHost = proxy.apiUmbrella.elasticsearch;

        if (elasticsearchHost) {
          // Get Elasticsearch data
          Meteor.call('getElasticsearchData', elasticsearchHost, queryParams, (error, dataset) => {
            if (error) {
              templateInstance.error.set(error);
              throw Meteor.Error(error);
            }
            // Update Elasticsearch data reactive variable with result
            templateInstance.elasticsearchData.set(dataset.aggregations);
          });

          // Worked fine
          Meteor.call('getElasticsearchData', elasticsearchHost, overviewChartsQuery,
            (error, dataset) => {
              if (error) throw Meteor.Error(error);
              // Update Elasticsearch data reactive variable with result
              templateInstance.overviewChartData.set(dataset.aggregations);
            });

          Meteor.call('getElasticsearchData', elasticsearchHost, totalNumbersQuery,
            (error, dataset) => {
              if (error) throw Meteor.Error(error);

              // Update Elasticsearch data reactive variable with result
              templateInstance.totalNumberData.set(dataset.aggregations);
            });

          Meteor.call('getElasticsearchData', elasticsearchHost, timelineChartsQuery,
            (error, dataset) => {
              if (error) throw Meteor.Error(error);

              // Update Elasticsearch data reactive variable with result
              templateInstance.timelineChartsData.set(dataset.aggregations);
            });

          Meteor.call('getElasticsearchData', elasticsearchHost, statusCodesQuery,
            (error, dataset) => {
              if (error) throw Meteor.Error(error);

              // Update Elasticsearch data reactive variable with result
              templateInstance.statusCodesData.set(dataset.aggregations);
            });
          Meteor.call('getElasticsearchData', elasticsearchHost, usersQuery,
            (error, dataset) => {
              if (error) throw Meteor.Error(error);

              templateInstance.frequentUsersData.set(dataset.aggregations);
            });

          Meteor.call('getElasticsearchData', elasticsearchHost, errorsQuery,
            (error, dataset) => {
              if (error) throw Meteor.Error(error);

              templateInstance.errorsStatisticData.set(dataset.aggregations);
            });
        }
      }
    }
  });
});

Template.apiAnalyticPageBody.helpers({
  elasticsearchData () {
    // Get reference to template instance
    const instance = Template.instance();

    // Return value of Elasticsearch host
    return instance.elasticsearchData.get();
  },
  fetchingData () {
    const instance = Template.instance();
    // Data is available if it has positive or negative (error) result
    return instance.elasticsearchData.get() || instance.error.get();
  },
  error () {
    const instance = Template.instance();
    // Get value of error
    return instance.error.get();
  },
  dataAvailable () {
    const elasticsearchData = Template.instance().elasticsearchData.get();

    // Data exists if requests number(doc_count) is greater than 0
    return elasticsearchData.group_by_interval.buckets.currentPeriod.doc_count > 0;
  },
  overviewChartData () {
    // Get reference to template instance
    const instance = Template.instance();

    // Return value of Elasticsearch host
    return instance.overviewChartData.get();
  },
  totalNumberData () {
    // Get reference to template instance
    const instance = Template.instance();

    // Return value of Elasticsearch host
    return instance.totalNumberData.get();
  },
  timelineChartsData () {
    // Get reference to template instance
    const instance = Template.instance();

    // Return value of Elasticsearch host
    return instance.timelineChartsData.get();
  },
  statusCodesData () {
    // Get reference to template instance
    const instance = Template.instance();

    // Return value of Elasticsearch host
    return instance.statusCodesData.get();
  },
  frequentUsersData () {
    // Get reference to template instance
    const instance = Template.instance();

    // Return value of Elasticsearch host
    return instance.frequentUsersData.get();
  },
  errorsStatisticData () {
    // Get reference to template instance
    const instance = Template.instance();

    // Return value of Elasticsearch host
    return instance.errorsStatisticData.get();
  },
});

Template.chartItem.onCreated(function () {
  const instance = this;

  instance.totalNumberBucket = new ReactiveVar();
  instance.statusCodesData = new ReactiveVar();


  instance.autorun(() => {
    // Get ES data
    const statusCodesData = Template.currentData().statusCodesData;

    if (statusCodesData) {

      const statusCodes = {};

      statusCodes.successCallsCount = statusCodesData.response_status.buckets.success.doc_count;
      statusCodes.redirectCallsCount = statusCodesData.response_status.buckets.redirect.doc_count;
      statusCodes.failCallsCount = statusCodesData.response_status.buckets.fail.doc_count;
      statusCodes.errorCallsCount = statusCodesData.response_status.buckets.error.doc_count;

      instance.statusCodesData.set(statusCodes);
    }
  });

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

      // const previousPeriodData = totalNumberData.group_by_interval.buckets.previousPeriod;
      //
      // const previousResponseTime = previousPeriodData.median_response_time.values['50.0'];
      // const previousUniqueUsers = previousPeriodData.unique_users.buckets.length;
      //
      // // Get the statistics comparing between previous and current periods
      // comparisonBucket.compareRequests =
      //   calculateTrend(previousPeriodData.doc_count, totalNumberBucket.requestNumber);
      // comparisonBucket.compareResponse =
      //   calculateTrend(parseInt(previousResponseTime, 10), totalNumberBucket.responseTime);
      // comparisonBucket.compareUsers =
      //   calculateTrend(previousUniqueUsers, totalNumberBucket.uniqueUsers);
      //
      // instance.comparisonBucket.set(comparisonBucket);
    }
  });
});

Template.chartItem.helpers({

  totalNumberBucket () {
    return Template.instance().totalNumberBucket.get();
  },
  overviewChartBucket () {
    const overviewChartData = Template.currentData().overviewChartData;

    return overviewChartData ? overviewChartData.requests_over_time.buckets : {};
  },
  responseStatusCodes () {
    return Template.instance().statusCodesData.get();
  },
});
