import React from 'react'

import { OrderedMap, fromJS } from 'immutable'

import {
  buildRemovedRowsSettingsObject,
  REMOVED_ROWS_SETTINGS_ACTION_REMOVED,
  REMOVED_ROWS_SETTINGS_ACTION_REVERTED,
} from 'services/event-tracking'

const useRemovedRowsSettings = (
  removedRowsIds,
  pmSection,
  getMultiplePmSections,
  setFeatureTrackingDataPersistent,
  setDefaultGaEvent,
) => {
  const [removedRows, setRemovedRows] = React.useState(OrderedMap())

  // Request removed rows ids
  React.useEffect(() => {
    getMultiplePmSections(removedRowsIds.valueSeq().toArray())
  }, [])

  const getRemovedRows = React.useCallback(() => {
    return pmSection.filter((section) => {
      return (
        !section.get('processing') &&
        removedRowsIds.find(rowId => rowId === section.getIn(['data', 'id']))
      )
    }).sort((a, b) => {
      const aHeader = a.getIn(['data', 'data', 'header', 'label'])
      const bHeader = b.getIn(['data', 'data', 'header', 'label'])
      let sort = 0
      if (aHeader > bHeader) sort = 1
      if (aHeader < bHeader) sort = -1
      return sort
    })
  }, [removedRowsIds, pmSection])

  const isLoading = React.useMemo(() => {
    const processeed = getRemovedRows().filter(row => !row.get('processing'))
    return removedRowsIds.count() !== processeed.size
  }, [removedRowsIds, getRemovedRows])

  // Set removed rows in local state after data is loaded
  React.useEffect(() => {
    if (removedRowsIds.count() > 0 && !isLoading && removedRows.size === 0) {
      setRemovedRows(getRemovedRows())
    }
  }, [removedRowsIds, removedRows, isLoading])

  const hideRow = (row) => {
    const id = row.getIn(['data', 'id'])
    const rowName = row.getIn(['data', 'data', 'header', 'label'])
    setFeatureTrackingDataPersistent({ data: fromJS({ hidePmSectionIds: [id] }) })
    setAddedBackFlagForHiddenRow(id, false)
    setDefaultGaEvent(buildRemovedRowsSettingsObject(
      rowName,
      REMOVED_ROWS_SETTINGS_ACTION_REMOVED,
    ))
  }

  const addRowBack = (row) => {
    const id = row.getIn(['data', 'id'])
    const rowName = row.getIn(['data', 'data', 'header', 'label'])
    setFeatureTrackingDataPersistent({ data: fromJS({ showPmSectionIds: [id] }) })
    setAddedBackFlagForHiddenRow(id, true)
    setDefaultGaEvent(buildRemovedRowsSettingsObject(
      rowName,
      REMOVED_ROWS_SETTINGS_ACTION_REVERTED,
    ))
  }

  // Update local state to know if a row was addded back or not
  const setAddedBackFlagForHiddenRow = (rowId, value) => {
    const removedRowsUpdated = removedRows.update(rowId, (rowToUpdate) => {
      if (rowToUpdate.getIn(['data', 'id']) === rowId) {
        return rowToUpdate.set('addedBack', value)
      }
      return rowToUpdate
    })
    setRemovedRows(removedRowsUpdated)
  }

  return { removedRows, hideRow, addRowBack }
}

export default useRemovedRowsSettings
