import axios from 'axios';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  participantId: string;
  companyId: string;
  day1: boolean;
  day2: boolean;
}

export const getSessionAttendance = async (sessionId: string): Promise<AttendanceRecord[]> => {
  const response = await axios.get(`/api/attendance/${sessionId}`);
  return response.data;
};

export const syncSessionAttendance = async (sessionId: string, items: { participantId: string; companyId: string; day1: boolean; day2: boolean }[]): Promise<AttendanceRecord[]> => {
  const response = await axios.post(`/api/attendance/${sessionId}/sync`, { items });
  return response.data;
};
