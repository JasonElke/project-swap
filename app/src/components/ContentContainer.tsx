import { FC } from 'react';
export const ContentContainer: FC = props => {

  return (
    <div className="flex-1 drawer h-52">
      <div className="items-center  drawer-content">
        {props.children}
      </div>
    </div>
  );
};
