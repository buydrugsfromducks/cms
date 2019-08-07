import * as React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { withRouter } from 'react-router-dom';
import { Menu as AntdMenu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { History } from 'history';

import { PATHS } from '../../routes';
import { IReducers } from '../../redux';
import { CommonApi } from '../../redux/common/common.api';
import { setMenu } from '../../redux/auth/auth.reducer';
import { getCurrentMenu } from '../../redux/auth/auth.selector';

interface IProps {
	appMenu?: string;
	history?: History;
	getMenu?: () => void;
	setMenu?: (menu: string) => void;
}

class Menu extends React.Component<IProps> {
	public render(): JSX.Element {
		const { appMenu } = this.props;

		return (
			<AntdMenu
				mode='inline'
				style={ { height: '100%', borderRight: 0 } }
				onClick={ this.onItemClick }
				selectedKeys={ [appMenu] }
			>
				<AntdMenu.Item key={ PATHS.CONTENT }>Контент</AntdMenu.Item>
				<AntdMenu.Item key={ PATHS.PEOPLE_SECTION }>Люди</AntdMenu.Item>
				<AntdMenu.Item key={ PATHS.COMPANY_SECTION }>Компании</AntdMenu.Item>
				<AntdMenu.SubMenu key={ 'other' } title={ <span><span>Приложение</span></span> }>
					<AntdMenu.Item key={ PATHS.EVENTS }>События</AntdMenu.Item>
					<AntdMenu.Item key={ PATHS.PEOPLE }>Люди</AntdMenu.Item>
					<AntdMenu.Item key={ PATHS.COMPANY }>Компании</AntdMenu.Item>
					<AntdMenu.Item key={ PATHS.MENU_EDIT }>Меню</AntdMenu.Item>
					<AntdMenu.Item key={ PATHS.FILEPICKER }>Изображения и файлы</AntdMenu.Item>
					{ /* <AntdMenu.Item key={PATHS.ICONS}>Значки</AntdMenu.Item> */ }
					<AntdMenu.Item key={ PATHS.LOCATIONS }>Локации</AntdMenu.Item>
				</AntdMenu.SubMenu>
			</AntdMenu>
		);
	}

	private onItemClick = (item: ClickParam) => {
		const { getMenu, history, setMenu } = this.props;
		setMenu(item.key);
		history.push(item.key);

		switch (item.key) {
			case PATHS.MENU_EDIT:
				getMenu();
				break;
			case PATHS.CONTENT:
				getMenu();
				break;
			default:
				return;
		}
	}
}

const mapStateToProps = (state: IReducers) => {
	return {
		appMenu: getCurrentMenu(state),
	};
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
	return {
		getMenu: () => dispatch(CommonApi.getMenu()),
		setMenu: (menuPath: string) => dispatch(setMenu({ menuPath })),
	};
};

export default compose(
	withRouter,
	connect(mapStateToProps, mapDispatchToProps),
)(Menu);
