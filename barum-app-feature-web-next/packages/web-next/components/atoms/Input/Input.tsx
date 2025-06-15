
import { TextInput, TextInputProps } from '@mantine/core';

interface BarInputProps extends TextInputProps {
}

const Input = ({ ...props }: BarInputProps) => {
  return <TextInput {...props} />;
};

export default Input;
