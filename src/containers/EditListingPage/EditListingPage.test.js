import React from 'react';
import { renderShallow } from '../../util/test-helpers';
import { fakeIntl } from '../../util/test-data';
import { EditListingPageComponent } from './EditListingPage';

describe('EditListingPageComponent', () => {
  it('matches snapshot', () => {
    const getListing = () => null;
    const tree = renderShallow(
      <EditListingPageComponent
        flattenedRoutes={[]}
        history={{ push: v => v }}
        getListing={getListing}
        images={[]}
        intl={fakeIntl}
        onCreateListing={v => v}
        onCreateListingDraft={v => v}
        onUpdateListingDraft={v => v}
        onImageUpload={v => v}
        onUpdateImageOrder={v => v}
        page={{ imageOrder: [], images: {} }}
        tab="description"
        type="new"
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
