import { useState, useEffect } from "react";
import { Typography } from "@mui/material";

function CountdownTimer({ endTime }) {
  const calculateTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;
    return diff > 0 ? diff : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <Typography variant="body2" color={timeLeft > 0 ? "text.primary" : "error"}>
      {timeLeft > 0
        ? `Time left: ${hours}h ${minutes}m ${seconds}s`
        : "Expired"}
    </Typography>
  );
}

export default CountdownTimer;
