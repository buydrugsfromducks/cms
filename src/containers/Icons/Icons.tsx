// import * as React from 'react';
// import { Dispatch } from 'redux';
// import { connect } from 'react-redux';
// import { Card, Row, Col, Popconfirm, Button, Modal } from 'antd';
// import { range } from 'lodash';
// import { EnumTarget, EnumType, IIcon } from 'react-cms';

// import { IReducers } from '../../redux';
// import { getMenuData } from '../../redux/common/common.selector';
// import { MenuEditListApi } from '../../components/MenuEditList/api/menuEditList';
// import FakeImg from '../../components/FakeImg/FakeImg';
// import { PeopleAPI } from '../People/api/people';
// import EditForm from './components/EditForm';

// interface IProps {
//   icons?: IIcon[];
//   updateEnum?: (id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void) => void;
//   getMenuData?: (enumTarget: EnumTarget) => void;
// }

// interface IState {
//   modalVisible: boolean;
// }

// class Icons extends React.Component<IProps, IState> {
//   public static defaultProps: Partial<IProps> = {
//     icons: [],
//   };
//   private static rowsNumber: number = 6;

//   constructor(props: IProps) {
//     super(props);

//     this.state = {
//       modalVisible: false,
//     };
//   }

//   public componentDidMount() {
//     const {getMenuData} = this.props;
//     getMenuData('icons');
//   }

//   public render(): JSX.Element {
//     const {icons} = this.props;
//     const {modalVisible} = this.state;
//     const rows: number = Math.ceil(icons.length / Icons.rowsNumber);
//     let currentIndex: number = 0;

//     return (
//       <Card
//         style={ {marginLeft: 185, height: '100vh'} }
//         title={ <Button icon={ 'plus' } type={ 'primary' } onClick={ this.onOpenAddModal }>Добавить иконку</Button> }
//       >
//         {
//           range(0, rows).map(index => (
//             <React.Fragment key={ `row_${index}` }>
//               <Row gutter={ 16 }>
//                 {
//                   range(0, Icons.rowsNumber).map(columnIndex => {
//                     if (currentIndex === icons.length) {
//                       return <React.Fragment key={ `no_${columnIndex}` } />;
//                     }

//                     const icon: IIcon = icons[currentIndex];
//                     currentIndex += 1;

//                     return (
//                       <Col span={ 4 } key={ `column_${columnIndex}` }>
//                         <Popconfirm
//                           title={ 'Вы точно хотите удалить?' }
//                           onConfirm={ this.delete(icon.id) }
//                           okText={ 'Да' }
//                           cancelText={ 'Нет' }
//                           placement={ 'bottom' }
//                         >
//                           {
//                             icon.url.includes('http')
//                               ? <img
//                                 src={ icon.url }
//                                 style={ {maxWidth: 100, maxHeight: 100, cursor: 'pointer'} }
//                               />
//                               : <FakeImg />
//                           }
//                         </Popconfirm>
//                       </Col>
//                     );
//                   })
//                 }
//               </Row>
//               <br />
//             </React.Fragment>
//           ))
//         }

//         <Modal visible={ modalVisible } footer={ null } onCancel={ this.onCloseModal } width={ 782 }>
//           <EditForm closeModal={ this.onCloseModal } type={ 'POST' } />
//         </Modal>
//       </Card>
//     );
//   }

//   private delete = (id: number) => () => this.props.updateEnum(id, 'DELETE', 'icons', {id}, () => this.props.getMenuData('icons'));

//   private onCloseModal = () => this.setState({modalVisible: false});

//   private onOpenAddModal = () => this.setState({modalVisible: true});
// }

// const mapStateToProps = (state: IReducers) => {
//   return {
//     icons: getMenuData(state, 'icons'),
//   };
// };

// const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
//   return {
//     getMenuData: (enumTarget: EnumTarget) => dispatch(MenuEditListApi.getMenuData(enumTarget)),
//     updateEnum(id: number, enumType: EnumType, enumTarget: EnumTarget, data: object, cb?: () => void) {
//       dispatch(PeopleAPI.updateEnum(id, enumType, enumTarget, data, cb));
//     },
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Icons);

export default null;
