import {
  ActivityIndicator,
  PermissionsAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/types/Link";
import { Place } from "@/lib/types/Place";
import { QUERY_PLACES } from "@/lib/api/graphql/queries";
import metrics from "../design/metrics";
import { getIconWithColor } from "../design/icons/getIconWithColor";
import { EIconName } from "../design/icons/_models";

const mapStyle = [
  {
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#eceaea",
      },
      {
        weight: 4.5,
      },
    ],
  },
  {
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#ffffff",
      },
      {
        weight: 2,
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        color: "#d2d1d1",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d6d6d6",
      },
    ],
  },
];

const uniqueBy = (arr: Link[], prop: keyof Link) => {
  return [...new Map(arr.map((m) => [m[prop], m])).values()];
};

export const PlacesMap = () => {
  const { data: placesData, loading: placesLoading } = useQuery<{
    places: Place[];
  }>(QUERY_PLACES);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allLinksModalVisible, setAllLinksModalVisible] = useState(false);
  const [userPosition, setUserPosition] = useState<{
    latitude: number | null;
    longitude: number | null;
    latitudeDelta: number;
    longitudeDelta: number;
  }>({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [activePlace, setActivePlace] = useState<Place | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (metrics.isIOS) {
          const result = await Geolocation.requestAuthorization("whenInUse");

          if (result === "granted") {
            setIsPermissionGranted(true);
          }
        } else {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);

          const isAllGranted =
            granted["android.permission.ACCESS_FINE_LOCATION"] === "granted";

          if (isAllGranted) {
            setIsPermissionGranted(true);
          }
        }
      } catch (error) {
        console.log("there is a problem with location");
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (isPermissionGranted) {
      Geolocation.getCurrentPosition(
        (position) => {
          setUserPosition((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }
  }, [isPermissionGranted]);

  const placesLinks: Link[] = useMemo(
    () =>
      placesData ? placesData.places.map((place) => place.link as Link) : [],
    [placesData],
  );

  const onMarkerPress = useCallback(
    (place: Place) => {
      setActivePlace(place);
      setIsModalVisible(true);
    },
    [setActivePlace],
  );

  const onToggleModal = useCallback(() => {
    setIsModalVisible((prev) => !prev);
    setActivePlace(null);
  }, []);

  const onToggleAllLinksModal = useCallback(() => {
    setAllLinksModalVisible((prev) => !prev);
  }, []);

  if (userPosition.longitude === null || userPosition.latitude === null) {
    return null;
  } else {
    return (
      <View style={[styles.container, styles.generalContainer]}>
        <View style={styles.viewTypeSelector}>
          <TouchableOpacity>
            {getIconWithColor(EIconName.PlacesSelectorIcon, "", "", {
              color: allLinksModalVisible ? "#D2DBDE" : "#1C4A5A",
            })}
          </TouchableOpacity>

          {getIconWithColor(EIconName.SmallDivider)}

          <TouchableOpacity onPress={onToggleAllLinksModal}>
            {getIconWithColor(EIconName.ListType, "", "", {
              color: allLinksModalVisible ? "#1C4A5A" : "#D2DBDE",
            })}
          </TouchableOpacity>
        </View>
        <MapView
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          style={styles.container}
          initialRegion={userPosition}
        >
          {placesData &&
            placesData.places.map((place, index) => (
              <Marker
                onPress={() => onMarkerPress(place)}
                key={index}
                coordinate={{
                  latitude: +place.latitude,
                  longitude: +place.longitude,
                }}
              >
                {activePlace && place.id === activePlace.id ? (
                  <MarkerActive />
                ) : (
                  <MarkerCommon />
                )}
              </Marker>
            ))}
        </MapView>

        <ContentBottomModal
          isVisible={isModalVisible}
          onToggleModal={onToggleModal}
        >
          {activePlace ? (
            <CardLinksList
              links={[activePlace.link]}
              showList={!placesLoading}
            />
          ) : (
            <ActivityIndicator />
          )}
        </ContentBottomModal>

        <ContentBottomModal
          isVisible={allLinksModalVisible}
          onToggleModal={onToggleAllLinksModal}
        >
          {placesLinks && placesLinks.length > 0 ? (
            <BottomSheetList links={uniqueBy(placesLinks, "id")} />
          ) : (
            <ActivityIndicator />
          )}
        </ContentBottomModal>
      </View>
    );
  }
};
