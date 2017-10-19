/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Npm packages imports
import moment from 'moment';

export default function queryForTotalNumbers (frontendPrefix, timeframe) {
  // Plus one day to include current day in selection
  const today = moment().add(1, 'days').format('YYYY-MM-DD');

  // Make it depends on timeframe
  const oneTimePeriodAgo = moment().subtract(timeframe - 1, 'days').format('YYYY-MM-DD');
  // eslint-disable-next-line no-mixed-operators
  const twoTimePeriodsAgo = moment().subtract(2 * timeframe - 1, 'days').format('YYYY-MM-DD');
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
            range: {
              request_at: {
                lt: today,
                gte: twoTimePeriodsAgo,
              },
            },
          },
        },
      },
      aggregations: {
        group_by_interval: {
          range: {
            field: 'request_at',
            keyed: true,
            ranges: [
              {
                key: 'previousPeriod',
                from: twoTimePeriodsAgo,
                to: oneTimePeriodAgo
              },
              {
                key: 'currentPeriod',
                from: oneTimePeriodAgo,
                to: today
              }
            ]
          },
          aggs: {
            median_response_time: {
              percentiles: {
                field: 'response_time',
                percents: [
                  50
                ]
              }
            },
            unique_users: {
              terms: {
                field: 'user_id'
              }
            }
          }
        }
      }
    }
  }
};
