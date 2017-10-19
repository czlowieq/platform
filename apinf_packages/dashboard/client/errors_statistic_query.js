/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Npm packages imports
import moment from 'moment';

export default function queryForErrorsStatistic (frontendPrefix, timeframe) {
  // Plus one day to include current day in selection
  const today = moment().add(1, 'days').format('YYYY-MM-DD');

  // Make it depends on timeframe
  const oneTimePeriodAgo = moment().subtract(timeframe - 1, 'days').format('YYYY-MM-DD');
  // Delete a last slash
  const requestPath = frontendPrefix.slice(0, -1);

  return {
    size: 0,
    body: {
      query: {
        filtered: {
          query: {
            bool: {
              should: [
                {
                  wildcard: {
                    request_path: {
                      // Add '*' to partially match the url
                      value: `${requestPath}*`,
                    },
                  },
                },
              ],
            },
          },
          filter: {
            and:
              [
                {
                  range: {
                    request_at: {
                      lt: today,
                      gte: oneTimePeriodAgo,
                    },
                  },
                },
                {
                  range: {
                    response_status: {
                      gte: 400,
                    },
                  },
                },
              ]
          }
        },
      },
      aggregations: {
        // Get date detailed by hour. Timestamp - key
        errors_over_time: {
          date_histogram: {
            field: 'request_at',
            interval: 'day',
            order: { _key: 'desc' },
          },
          aggs: {
            request_path: {
              terms: {
                field: 'request_path',
              },
              aggs: {
                // Return values of errors status code. Calls - doc_count, code - key
                response_status: {
                  terms: {
                    field: 'response_status',
                  },
                },
              },
            },
          },
        }
      }
    }
  }
};
