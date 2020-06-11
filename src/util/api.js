import { types as sdkTypes, transit } from './sdkLoader';
import Decimal from 'decimal.js';

const apiBaseUrl = () => {
  const port = process.env.REACT_APP_DEV_API_SERVER_PORT;
  const useDevApiServer = process.env.NODE_ENV === 'development' && !!port;

  // In development, the dev API server is running in a different port
  if (useDevApiServer) {
    return `http://localhost:${port}`;
  }

  // Otherwise, use the same domain and port as the frontend
  return '/';
};

const typeHandlers = [
  {
    type: sdkTypes.BigDecimal,
    customType: Decimal,
    writer: v => new sdkTypes.BigDecimal(v.toString()),
    reader: v => new Decimal(v.value),
  },
];

const serialize = data => {
  return transit.write(data, { typeHandlers });
};

const deserialize = str => {
  return transit.read(str, { typeHandlers });
};

const post = (path, body) => {
  const url = `${apiBaseUrl()}${path}`;
  const options = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/transit+json',
    },
    body: serialize(body),
  };
  return window
    .fetch(url, options)
    .then(res => {
      if (res.status >= 400) {
        const e = new Error('Local API request failed');
        e.apiResponse = res;
        throw e;
      }
      return res;
    })
    .then(res => {
      const contentTypeHeader = res.headers.get('Content-Type');
      const contentType = contentTypeHeader ? contentTypeHeader.split(';')[0] : null;
      if (contentType === 'application/transit+json') {
        return res.text().then(deserialize);
      } else if (contentType === 'application/json') {
        return res.json();
      }
      return res.text();
    });
};

export const transactionLineItems = body => {
  return post('/api/transaction-line-items', body);
};

export const initiatePrivileged = body => {
  return post('/api/initiate-privileged', body);
};
