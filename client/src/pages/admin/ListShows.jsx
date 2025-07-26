import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, getToken, user } = useAppContext();

  const [shows, setShows] = useState([]);
  const [eventDetails, setEventDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch all event details by event ids
  const fetchEventDetails = async (eventIds) => {
    try {
      // Remove duplicates and falsy values
      const uniqueIds = [...new Set(eventIds.filter(Boolean))];
      console.log('Fetching event details for ids:', uniqueIds);
      if (uniqueIds.length === 0) return;
      const { data } = await axios.get('/api/event/all', {
        params: { ids: uniqueIds.join(',') },
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      console.log(data);
      if (data.success) {
        // Map eventId -> event object
        const map = {};
        data.events.forEach((ev) => {
          map[ev._id] = ev;
        });
        setEventDetails(map);
      }
    } catch (e) {
      // ignore
    }
  };

  const getAllShows = async () => {
    try {
      const { data } = await axios.get('/api/admin/all-shows', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setShows(data.shows || []);
        // Collect event ids for shows of type 'event'
        const eventIds = (data.shows || [])
          .filter((show) => show.type === 'event')
          .map((show) => show.event?._id || show.event);
        fetchEventDetails(eventIds);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Shows" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Type</th>
              <th className="p-2 font-medium">Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Organizer</th>
              <th className="p-2 font-medium">Kind</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {shows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-400">
                  No shows found.
                </td>
              </tr>
            )}
            {shows.map((show, index) => {
              const isMovie = show.type === 'movie';
              const isEvent = show.type === 'event';
              // If event, prefer details from eventDetails map
              let eventObj = show.event;
              if (isEvent && eventDetails) {
                const eventId = show.event?._id || show.event;
                if (eventDetails[eventId]) {
                  eventObj = eventDetails[eventId];
                }
              }
              const name = isMovie
                ? show.movie?.title || '-'
                : eventObj?.name || '-';
              const organizer = isEvent
                ? eventObj?.organizer || '-'
                : show.movie?.original_language
                ? `Lang: ${show.movie.original_language}`
                : '-';
              const kind = isEvent
                ? eventObj?.kind || '-'
                : show.movie?.genres && show.movie.genres.length > 0
                ? show.movie.genres.map((g) => g.name).join(', ')
                : '-';
              return (
                <tr
                  key={index}
                  className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 min-w-20 pl-5 capitalize">{show.type}</td>
                  <td className="p-2 min-w-45">{name}</td>
                  <td className="p-2">{dateFormat(show.showDateTime)}</td>
                  <td className="p-2">{organizer}</td>
                  <td className="p-2">{kind}</td>
                  <td className="p-2">
                    {Object.keys(show.occupiedSeats || {}).length}
                  </td>
                  <td className="p-2">
                    {currency}{' '}
                    {(Object.keys(show.occupiedSeats || {}).length || 0) *
                      (show.showPrice || 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListShows;
