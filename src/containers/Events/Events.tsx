import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Card, Icon, Menu, Dropdown, notification, Badge } from 'antd';
import * as moment from 'moment';
import { range } from 'lodash';
import { IEvent, IUser } from 'react-cms';

import './Events.scss';

import { IReducers } from '../../redux';
import { EventsAPI } from './api/events';
import { getEvents } from '../../redux/common/common.selector';
import { IEventData } from '../../redux/auth/auth.reducer';
import { ONLY_DATE_FORMAT } from '../../service/Consts/Consts';
import { getUserData } from '../../redux/auth/auth.selector';
import b from '../../service/Utils/b';

interface IProps {
  user?: IUser;
  events?: IEvent[];
  getEvents?: () => void;
  updateEvent?: (event: IEventData) => void;
}

class Events extends React.Component<IProps> {
  private static rowsNumber: number = 3;

  public componentDidMount() {
    const {getEvents} = this.props;
    getEvents();
  }

  public render(): JSX.Element {
    const {events, user} = this.props;

    if (!events.some(item => item.id === -1)) {
      events.push({...events[0], id: -1});
    }

    const rows: number = Math.ceil(events.length / Events.rowsNumber);
    let currentIndex: number = 0;

    return (
      <Card style={ {marginLeft: 185, height: '100vh'} }>
        {
          range(0, rows).map(index => (
            <div className={ b('events', 'parent') } key={ index }>
              {
                range(0, Events.rowsNumber).map(columnIndex => {
                  if (currentIndex === events.length) {
                    return <React.Fragment key={ `no_${columnIndex}` } />;
                  }

                  const event: IEvent = events[currentIndex];
                  currentIndex += 1;
                  const cardData: JSX.Element = (
                    <Card
                      className={ b('events', 'child') }
                      cover={ <div style={ {height: 158, background: '#4aabe0'} } /> }
                      actions={ [
                        <React.Fragment key={ 1 } />,
                        <Dropdown key={ 2 } overlay={ this.getDropDownMenu(event) } placement={ 'topCenter' } trigger={ ['click', 'hover'] }>
                          <Icon type={ 'ellipsis' } style={ {transform: 'rotate(90deg)', cursor: 'pointer'} } />
                        </Dropdown>,
                      ] }
                    >
                      {
                        event.id === user.appdata.eventID && (
                          // @ts-ignore
                          <Badge className={ b('events', 'badge') } count={ <Icon type={ 'check' } /> } style={ {background: '#52c41a'} } />
                        )
                      }
                      <Card.Meta
                        title={ event.name }
                        description={ `${moment.unix(event.starttime).format(ONLY_DATE_FORMAT)} - ${moment.unix(event.endtime).format(ONLY_DATE_FORMAT)}` }
                      />
                    </Card>
                  );

                  return (
                    <React.Fragment key={ `column_${columnIndex}` }>
                      {
                        event.id !== -1
                          ? cardData
                          : (
                            <Card
                              className={ b('events', 'child-doted') }
                              style={ { 
                                border: '1px solid transparent',
                                textAlign: 'center',
                                cursor: 'pointer'} }
                              cover={ <div style={ {height: 191, background: '#ffffff'} } /> }
                              onClick={ this.onAddNotification }
                            >
                              <Icon
                                type={ 'plus' }
                                style={ {
                                  marginLeft: 'auto',
                                  marginRight: 'auto',
                                  position: 'relative',
                                  transform: 'translateY(-50%) scale(3, 3)',
                                  top: -72,
                                } }
                              />
                            </Card>
                          )
                      }
                    </React.Fragment>
                  );
                })
              }
            </div>
          ))
        }
      </Card>
    );
  }

  private onUpdateEvent = (event: IEventData) => () => this.props.updateEvent(event);
  private onAddNotification = () => notification.warning({message: '!', description: 'Для создания нового события обратитесь в SDNA'});

  private getDropDownMenu = (event: IEvent): JSX.Element => (
    <Menu>
      <Menu.Item>
        <span
          onClick={ this.onUpdateEvent({
            name: event.name,
            id: event.id,
            timeShift: event.timeShift,
          }) }
        >
          Сделать активным
        </span>
      </Menu.Item>
    </Menu>
  );
}

const mapStateToProps = (state: IReducers) => {
  return {
    events: getEvents(state),
    user: getUserData(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    getEvents: () => dispatch(EventsAPI.getEvents()),
    updateEvent: (event: IEventData) => dispatch(EventsAPI.updateEvent(event)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
