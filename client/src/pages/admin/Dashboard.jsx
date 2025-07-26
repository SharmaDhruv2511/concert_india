import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UsersIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { dummyDashboardData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    photo: '',
    organizer: '',
    description: '',
    kind: '',
  });
  const [eventDetails, setEventDetails] = useState({});

  const dashboardCards = [
    {
      title: 'Total Bookings',
      value: dashboardData.totalBookings || '0',
      icon: ChartLineIcon,
    },
    {
      title: 'Total Revenue',
      value: currency + dashboardData.totalRevenue || '0',
      icon: CircleDollarSignIcon,
    },
    {
      title: 'Active Shows',
      value: dashboardData.activeShows.length || '0',
      icon: PlayCircleIcon,
    },
    {
      title: 'Total Users',
      value: dashboardData.totalUser || '0',
      icon: UsersIcon,
    },
  ];

  // Fetch event details by ids
  const fetchEventDetails = async (eventIds) => {
    if (!eventIds.length) return;
    try {
      const { data } = await axios.get('/api/event/by-ids', {
        params: { ids: eventIds.join(',') },
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      console.log(data);
      if (data.success) {
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

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      // console.log(data);
      if (data.success) {
        setDashboardData(data.dashboardData);
        // Collect unique event ids from activeShows
        const eventIds = Array.from(
          new Set(
            (data.dashboardData.activeShows || []).map((show) => show.event)
          )
        );
        fetchEventDetails(eventIds);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error fetching dashboard data:', error);
    }
  };

  const handleAddEvent = async () => {
    try {
      const { data } = await axios.post('/api/event/add', eventForm, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      // console.log(data);
      if (data.success) {
        toast.success('Event added!');
        setShowEventModal(false);
        setEventForm({
          name: '',
          date: '',
          photo: '',
          organizer: '',
          description: '',
          kind: '',
        });
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Failed to add event');
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-lg font-medium">Active Shows</p>
      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <BlurCircle top="100px" left="-10%" />
        {dashboardData.activeShows.map((show) => {
          const eventObj = eventDetails[show.event] || {};
          return (
            <div
              key={show._id}
              className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
            >
              <img
                src={eventObj.photo || '/default-event.jpg'}
                alt=""
                className="h-60 w-full object-cover"
              />
              <p className="font-medium p-2 truncate">{eventObj.name || '-'}</p>
              <div className="flex items-center justify-between px-2">
                <p className="text-lg font-medium">
                  {currency} {show.showPrice}
                </p>
                <p className="text-sm text-gray-400 mt-1 pr-1">
                  {eventObj.kind || ''}
                </p>
              </div>
              <p className="px-2 pt-2 text-sm text-gray-500">
                {dateFormat(show.showDateTime)}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowEventModal(true)}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-all cursor-pointer"
        >
          + Add Event
        </button>
      </div>
      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Event</h2>
            <input
              className="w-full mb-2 p-2 border rounded"
              placeholder="Event Name"
              value={eventForm.name}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="w-full mb-2 p-2 border rounded"
              type="date"
              value={eventForm.date}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, date: e.target.value }))
              }
            />
            <input
              className="w-full mb-2 p-2 border rounded"
              placeholder="Photo URL"
              value={eventForm.photo}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, photo: e.target.value }))
              }
            />
            <input
              className="w-full mb-2 p-2 border rounded"
              placeholder="Organizer"
              value={eventForm.organizer}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, organizer: e.target.value }))
              }
            />
            <input
              className="w-full mb-2 p-2 border rounded"
              placeholder="Kind (e.g. Concert, Seminar)"
              value={eventForm.kind}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, kind: e.target.value }))
              }
            />
            <textarea
              className="w-full mb-2 p-2 border rounded"
              placeholder="Description"
              value={eventForm.description}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <Loading />
  );
};

export default Dashboard;
