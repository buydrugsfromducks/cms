import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Card, Button } from 'antd';
import { IContainer } from 'react-cms';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState } from 'draft-js';

import { IReducers } from '../../../redux';
import { ContentAPI } from '../api/content';
import { getContainer } from '../../../redux/common/common.selector';

import Input from '../../../components/Input/Input';

interface IProps {
  container?: IContainer;
  updateContainer?: (id: number, action: string, data: object) => void;
}

interface IState {
  editorState: EditorState;
  title: string;
}

class ModulePage extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      editorState: null,
      title: '',
    };
  }

  public componentDidMount() {
    const {container: {data}} = this.props;
    if (data.id) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(data.body)),
        title: data.title,
      });
    }
  }

  public componentDidUpdate(prevState: IProps) {
    const {container: {data}} = this.props;
    if (data.id && data.body !== prevState.container.data.body) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromText(data.body)),
      });
    }
  }

  public render(): JSX.Element {
    const {editorState, title} = this.state;

    return (
      <Card style={ {height: '100%'} } bodyStyle={ {height: '100%'} }>
        <span>Заголовок</span>
        <Input value={ title } onChange={ this.onChangeTitle } />

        <br />
        <br />

        <span>Описание</span>
        <Editor
          toolbarClassName={ 'toolbarClassName' }
          wrapperClassName={ 'wrapperClassName' }
          editorClassName={ 'editorClassName' }
          localization={ {locale: 'ru'} }
          editorState={ editorState }
          onEditorStateChange={ this.onChangeText }
          wrapperStyle={ {height: '80%'} }
        />

        <hr />

        <Button type={ 'primary' } onClick={ this.update } style={ {zIndex: 99999} }>
          Сохранить
        </Button>
      </Card>
    );
  }

  private onChangeTitle = (title: string) => this.setState({title});

  private onChangeText = (editorState: EditorState) => this.setState({editorState});

  private update = event => {
    const {container, updateContainer} = this.props;
    const {editorState, title} = this.state;
    const body: string = editorState.getCurrentContent().getPlainText();

    updateContainer(
      container.id,
      'edit',
      {id: container.id, body, title},
      );
  };
}

const mapStateToProps = (state: IReducers) => {
  return {
    container: getContainer(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    updateContainer: (id: number, action: string, data: object, cb?: () => void) => dispatch(ContentAPI.updateContainer(id, action, data, cb)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModulePage);
