import React, { useState, useEffect, useRef } from 'react'
import { ISiteUserInfo } from '@pnp/sp/site-users/types'
import { Stack, Icon, Separator } from '@fluentui/react'
import { BsDisplay } from 'react-icons/bs'

import * as strings from 'TvAppWebPartStrings'
import { DisplayMode } from '@tvApp/types'


import styles from './PlacesPanel.module.scss'

import { SettingsIcon } from '@components/Icons'

import PlaceOption from './PlaceOption'
import PlacesListShimmer from './PlacesListShimmer'
import AddPlaceDialog from './AddPlaceDialog'

export interface PlacesPanelProps {
  id: string
  selectedPlace: any
  displayMode: DisplayMode
  placesChoices: any[]
  siteUrl: string
  person: ISiteUserInfo
  placesLoading: boolean
  getPlaces: () => void
  setShowGlobalSettings: (shouldShow: boolean) => void
  changePlace: (placeName: string) => void
  valueChange: (value: any, state: string, property?: string) => void
  setDisplayMode: (displayMode: DisplayMode) => void
}

const nested = {
  nesting: {
    nested: {
      nest: {

      }
    }
  }
}

const object = {
  one: 'abc',
  two: 123,
  three: true,
  four: undefined,
  five: null,
  six: ['1', 2, true],
  seven: { x: 5, y: Math.PI },
  eight: Array.isArray([1, 2, 3]),
  nine: () => console.log('lol'),
}

const PlacesPanel = ({
  id,
  selectedPlace,
  displayMode,
  placesChoices,
  person,
  placesLoading,
  changePlace,
  getPlaces,
}: PlacesPanelProps): JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAddPlaceDialog, setShowAddPlaceDialog] = useState(false)

  const panelRef = useRef<HTMLDivElement>()

  useEffect(() => {
    if (displayMode !== DisplayMode.ChoosePlace) {
      setIsCollapsed(true)
    } else {
      setIsCollapsed(false)
    }
  }, [displayMode])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!panelRef?.current?.contains(e.target)) {
        if (selectedPlace.Title !== "All" && displayMode !== DisplayMode.ChoosePlace) {
          setIsCollapsed(true)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [panelRef, selectedPlace, displayMode])

  const toggleHideDialog = () => {
    setShowAddPlaceDialog(prev => !prev)
  }

  return (
    <div ref={panelRef} id={id + "dropdown"} className={`${styles.placesPanelContainer} ${isCollapsed ? styles.placesPanelContainer__collapsed : ''}`}>
      <div>Hello there</div>
      {isCollapsed ? (
        <div className={styles.placesPanelContainer__clicker} onClick={() => setIsCollapsed(false)}>
          <Icon iconName="ChevronRight" />
        </div>
      ) : (
        <div className={styles.placesPanelContent}>
          <div className={styles.placesPanelLogo}>
            <span><span>TV</span>App <BsDisplay /></span>
          </div>
          <Separator />
          {/* <h4 className={styles.placesPanelHeader}>{strings.ChoosePlaceLabel}</h4> */}
          <Stack className={styles.placesList} >
            {(placesChoices?.length >= 1 && !placesLoading) ? (placesChoices.map(place => <PlaceOption
              isSelected={place?.text === selectedPlace?.Title}
              key={place.key}
              id={place.key}
              text={place.text}
              changePlace={changePlace}
              setDisplayMode={setDisplayMode}
            />)) :
              placesLoading ? (
                <PlacesListShimmer />
              ) : (
                <div className={styles.placesPanelNoPlaces}>
                  <Separator />
                  <div className={styles.placesPanelNoPlaces__text}>
                    <Icon styles={{ root: { fontSize: '24px', backgroundColor: 'transparent' } }} iconName="Info" />
                    <span>{strings.placesPanelNoPlaces} {person?.IsSiteAdmin && strings.placesPanelNoPlacesAdmin}</span>
                  </div>
                  <Separator />
                </div>
              )}
          </Stack>
          {person?.IsSiteAdmin && (
            <div className={`${styles.placesPanelOptionContainer}`}>
              <div className={styles.placesPanelMenuOption}>
                <Icon iconName="Globe" />
                <p
                  onClick={() => {
                    changePlace('All')
                  }}
                >
                  {strings.addGlobalSlides}
                </p>
              </div>
              <div className={styles.placesPanelMenuOption}>
                <Icon iconName="Add" />
                <p onClick={() => setShowAddPlaceDialog(true)}>
                  {strings.ManagePlacesText}
                </p>
              </div>
              <div className={styles.placesPanelMenuOption}>
                <SettingsIcon />
                <p onClick={() => {
                  setShowGlobalSettings(true)
                  // // targets hidden edit and save button
                  // const propertyPaneButton: HTMLElement = document.querySelector('#spCommandBar button.ms-Button--primary') as HTMLElement
                  // propertyPaneButton?.click()
                }}>
                  {strings.globalSettings}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {showAddPlaceDialog && (
        <AddPlaceDialog toggleHideDialog={toggleHideDialog} showDialog={showAddPlaceDialog} getPlaces={getPlaces} changePlace={changePlace} />
      )}
    </div>
  )
}

export default PlacesPanel
