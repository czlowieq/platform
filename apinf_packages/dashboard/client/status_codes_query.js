/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Npm packages imports
import moment from 'moment';

export default function queryForStatusCodes (frontendPrefix, timeframe) {
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
            range: {
              request_at: {
                lt: today,
                gte: oneTimePeriodAgo,
              },
            },
          },
        },
      },
      aggregations: {
        // Get total count of each response status
        response_status: {
          range: {
            field: 'response_status',
            keyed: true,
            // Includes the *from* value and excludes the *to* value for each range.
            ranges: [
              { key: 'success', from: 200, to: 300 },
              { key: 'redirect', from: 300, to: 400 },
              { key: 'fail', from: 400, to: 500 },
              { key: 'error', from: 500, to: 600 },
            ],
          },
        },
      }
    }
  }
};
