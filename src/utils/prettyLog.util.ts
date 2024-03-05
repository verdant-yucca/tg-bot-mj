import boxen from 'boxen';

interface LogPrettier {
  message: string;
  options: {
    padding: number;
    borderColor: string;
  };
}

const prettyLog = (data: LogPrettier) => {
  const { message, options } = data;
  console.log(boxen(message, { padding: options.padding, borderColor: options.borderColor }));
};

export { prettyLog };
