import { getNavPageButtonSpec } from './dashboard-utils/dashboard-page-buttons-utils.js';
import buildDOM from '../table/build-dom.js';

/**
 * Create dashboardPagination with prevPage, dashboardPages and nextPage.
 */
function createDashboardPagination() {
  const dashboardPagination = pickElem('dashboardPagination');

  if (dashboardPagination && pickElem('dashboardPages')) return;
  if (dashboardPagination) dashboardPagination.remove(); // delete possibly existing node

  const dboPanel = querySel('.dbo-panel');
  if (!dboPanel) return;

  const params = {
    parentSelector: '.dbo-panel',
    elems: [
      { parentSelector: '.dbo-panel', tagName: 'div', newId: 'dashboardPagination' },
      getNavPageButtonSpec('prevPage'),
      { parentId: 'dashboardPagination', tagName: 'div', newId: 'dashboardPages' },
      getNavPageButtonSpec('nextPage'),
    ],
  };

  buildDOM(params);
}

export default createDashboardPagination;
