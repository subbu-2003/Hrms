import { Button } from "antd";
import React from "react";

interface AddButtonProps {
  label?: string;        // Button text (default: Add New)
  onClick: () => void;
  className?: string;
}

const AddButton: React.FC<AddButtonProps> = ({
  label = "Add New",
  onClick,
  className = "",
}) => {
  return (
    <Button
      type="primary"
      className={className}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

export default AddButton;