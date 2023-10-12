import { Text } from "@tremor/react";

const getGreetings = () => {
  const currentHour = new Date().getHours();
  let greeting;
  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  return greeting;
};
export const GreetingsComponent = ({ text }:{text:string}) => {
  return <Text>{`${getGreetings()}, ${text}`}</Text>;
};
